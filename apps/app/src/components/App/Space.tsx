import React, { memo, useCallback, useEffect, useState } from 'react'
import { Item, Dropdown, TextInput, Button, Box, Gap, ItemProps, ContextMenu, Page, StyleHTML, markdownToHTML, RichTextEditor, LineBreak, AspectRatio, FileUpload, FileDrop, useDialog } from '@avsync.live/formation'
import { pb } from 'redux-tk/pocketbase'
import { useSpaces_activeSpace, useSpaces_countById } from 'redux-tk/spaces/hooks'
import { GroupSuggestions } from './Suggestions/GroupSuggestions'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useRemoveQueryParam } from 'utils/removeEditQuery'
import { Breadcrumbs } from './Breadcrumbs'
import { ConfirmationMessage } from 'components/Util/ConfirmationMessage'
import { Count } from './Count'
import { ImageDropTarget } from 'components/Util/ImageDrop'
import { ImageSuggestions } from './Suggestions/ImageSuggestions'
import { SpaceSuggestions } from './Suggestions/SpaceSuggestions'

export const Space = memo(({ create }: { create?: boolean }) => {
  const navigate = useNavigate()
  const space = useSpaces_activeSpace()
  const count = useSpaces_countById(space?.id)

  const { openDialog } = useDialog()

  const [searchParams] = useSearchParams()
  const removeQueryParam = useRemoveQueryParam()

  const [edit, setEdit] = useState(!!searchParams.get('edit') || create)

  const [name, setName] = useState(space?.name)
  const [description, setDescription] = useState(space?.description)
  const [banner, setBanner] = useState(space?.banner ? `http://localhost:8090/api/files/spaces/${space.id}/${space.banner}` : null)
  const [icon, setIcon] = useState(space?.icon ? `http://localhost:8090/api/files/spaces/${space.id}/${space.icon}` : null)

  const [bannerFile, setBannerFile] = useState(null)
  const [iconFile, setIconFile] = useState(null)

  useEffect(() => {
    setName(create ? '' : space?.name)
    setDescription(create ? '' : space?.description)
    setBanner(create ? '' : space?.banner ? `http://localhost:8090/api/files/spaces/${space.id}/${space.banner}` : null)
    setIcon(create ? '' : space?.icon ? `http://localhost:8090/api/files/spaces/${space.id}/${space.icon}` : null)
  }, [space, create])

  const handleDelete = async () => {
    try {
      await pb.collection('spaces').delete(space.id)
      console.log('Space deleted')
      navigate('/')
    } 
    catch (error) {
      console.error('Failed to delete space:', error)
      alert('Failed to delete space')
    }
  }

  const handleUpdate = async () => {
    try {
      const formData = new FormData()
      if (bannerFile) {
        formData.append('banner', bannerFile)
      }
      if (iconFile) {
        formData.append('icon', iconFile)
      }
      formData.append('name', name)
      formData.append('description', description)
      await pb.collection('spaces').update(space.id, formData)
      setEdit(false)
      removeQueryParam('edit')
      console.log('Space updated')
    } 
    catch (error) {
      console.error('Failed to update space:', error)
      alert('Failed to update space')
    }
  }

  const handleCancelEdit = useCallback(() => {
    setName(space.name)
    setDescription(space.description)
    setBanner(space?.banner ? `http://localhost:8090/api/files/spaces/${space.id}/${space.banner}` : null)
    setIcon(space?.icon ? `http://localhost:8090/api/files/spaces/${space.id}/${space.icon}` : null)
    setEdit(false)
    removeQueryParam('edit')
  }, [space])

  const dropdownItems = [
    {
      icon: 'edit',
      iconPrefix: 'fas',
      compact: true,
      text: 'Edit',
      onClick: () => setEdit(true)
    },
    {
      children: <LineBreak color='var(--F_Font_Color_Disabled)'/>
    },
    {
      icon: 'trash-alt',
      iconPrefix: 'fas',
      compact: true,
      text: 'Delete',
      onClick: (e) => {
        e.stopPropagation()
        openDialog({
          mode: 'confirm',
          children: <ConfirmationMessage
            message='Are you sure you want to delete this space?'
            name={space?.name}
            warning={`${count?.groups} groups, ${count?.channels} channels, ${count?.threads} threads, and ${count?.messages} messages will also be deleted.`}
          />,
          callback: shouldDelete => { if (shouldDelete) handleDelete() }
        })
      },
    }
  ] as ItemProps[]

  const [suggestions, setSuggestions] = useState<any[]>()

  async function handleCreate() {
    try {
      const formData = new FormData()
      if (bannerFile) {
        formData.append('banner', bannerFile)
      }
      if (iconFile) {
        formData.append('icon', iconFile)
      }
      formData.append('name', name)
      formData.append('description', description)
      const response = await pb.collection('spaces').create(formData)
      if (suggestions && suggestions.length > 0 && response.id) {
        for (const group of suggestions) {
          const groupResponse = await pb.collection('groups').create({ 
            name: group.name, 
            description: group.description, 
            spaceid: response.id 
          })
          for (const channel of group.channels) {
            await pb.collection('channels').create({ 
              name: channel.name, 
              description: channel.description, 
              groupid: groupResponse.id 
            })
          }
        }
      }
      navigate(`/spaces/${response.id}`)
    } 
    catch (error) {
      console.error('Failed to create space:', error)
      alert('Error creating space. Check console for details.')
    }
  }

  return (<>
    {
      !create && <Breadcrumbs />
    }
    <Page>
      <Box width='100%' py={.5} wrap>
        {
          create && <Item pageTitle='Create space' disablePadding />
        }
        {
            edit
              ? <Box width='100%' mt={.5}>
                  <Gap disableWrap>
                    <Gap>
                      <Gap disableWrap>
                          {
                            icon && <Box width={10}>
                              <ImageDropTarget
                                onFileConverted={(file) => {
                                  setIconFile(file)
                                  setIcon(URL.createObjectURL(file))
                                }}
                              >
                                <FileDrop 
                                  onFileDrop={files => {
                                    const file = files?.[0]
                                    if (file) {
                                      setIconFile(file)
                                      setIcon(URL.createObjectURL(file))
                                    }
                                  }}
                                >
                                  <AspectRatio
                                    ratio={1}
                                    backgroundSrc={icon}
                                    coverBackground
                                    borderRadius={1}
                                  />
                                </FileDrop>
                              </ImageDropTarget>
                            </Box>
                          }

                        {
                          banner && <ImageDropTarget
                            onFileConverted={(file) => {
                              setBannerFile(file)
                              setBanner(URL.createObjectURL(file))
                            }}
                          >
                            <FileDrop 
                              onFileDrop={files => {
                                const file = files?.[0]
                                if (file) {
                                  setBannerFile(file)
                                  setBanner(URL.createObjectURL(file))
                                }
                              }}
                            >
                              <AspectRatio
                                ratio={3/1}
                                backgroundSrc={banner}
                                coverBackground
                                borderRadius={1}
                              />
                            </FileDrop>
                          </ImageDropTarget>
                        }
                      </Gap>

                      <ImageSuggestions 
                        placeholder='Suggest an icon'
                        prompt={`
                          This is for an icon. It must look good when small.
                          Space name: ${name}
                          Description: ${description}
                        `}
                        onFileReady={(file) => {
                          setIconFile(file)
                          setIcon(URL.createObjectURL(file))
                        }}
                        square
                      >
                        <FileUpload
                          minimal
                          buttonProps={{
                            icon: 'image',
                            iconPrefix: 'fas',
                            text: 'Choose icon',
                            compact: true,
                            expand: true
                          }}
                          onFileChange={files => {
                            const file = files?.[0]
                            if (file) {
                              setIconFile(file)
                              setIcon(URL.createObjectURL(file))
                            }
                          }}
                        />
                      </ImageSuggestions>

                      <ImageSuggestions 
                        placeholder='Suggest a banner'
                        prompt={`
                          Space name: ${name}
                          Description: ${description}
                        `}
                        onFileReady={(file) => {
                          setBannerFile(file)
                          setBanner(URL.createObjectURL(file))
                        }}
                      >
                        <FileUpload
                          minimal
                          buttonProps={{
                            icon: 'image',
                            iconPrefix: 'fas',
                            text: 'Choose banner',
                            compact: true,
                            expand: true
                          }}
                          onFileChange={files => {
                            const file = files?.[0]
                            if (file) {
                              setBannerFile(file)
                              setBanner(URL.createObjectURL(file))
                            }
                          }}
                        />
                      </ImageSuggestions>
                      
                      <Gap disableWrap>
                        <TextInput
                          value={name}
                          onChange={val => setName(val)}
                          autoFocus
                          label='Name'
                          onEnter={handleUpdate}
                          hero
                        />
                        {
                          !create && <Button
                            icon='times'
                            iconPrefix='fas'
                            square
                            onClick={handleCancelEdit}
                            hero
                          />
                        }
                       
                        <Button
                          icon='check'
                          iconPrefix='fas'
                          square
                          onClick={create ? handleCreate : handleUpdate}
                          hero
                          primary
                        />
                      </Gap>
                      
                      <RichTextEditor
                        outline
                        px={1}
                        placeholder='Description'
                        value={description}
                        onChange={val => setDescription(val)}
                      />
                    </Gap>
                  </Gap>
                </Box>
              : <ContextMenu
                  dropdownProps={{
                    items: dropdownItems
                  }}
                >
                  {
                    banner && <AspectRatio
                      ratio={3/1}
                      backgroundSrc={banner}
                      coverBackground
                      borderRadius={1}
                    />
                  }
                  <Item
                    pageTitle={edit ? 'Edit Space' : space?.name}
                    absoluteRightChildren
                    small
                  >
                    <Box height={'100%'}>
                      <Count count={count?.groups} />
                      <Count count={count?.channels} />
                      <Count count={count?.threads} />
                      <Count count={count?.messages} />
                      <Dropdown
                        icon='ellipsis-h'
                        iconPrefix='fas'
                        compact
                        square
                        minimal
                        items={dropdownItems}
                      />
                    </Box>
                  </Item>

                  <GroupSuggestions />

                  <StyleHTML>
                    <div dangerouslySetInnerHTML={{ __html: markdownToHTML(description || '') || '' }} />
                  </StyleHTML>
                </ContextMenu> 
        }
      </Box>
      {
        create && <SpaceSuggestions 
          onSuggestions={(val) => setSuggestions(val)}
          name={name}
          description={description}
        />
      }
    </Page>
  </>)
})
