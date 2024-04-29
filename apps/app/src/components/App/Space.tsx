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

export const Space = memo(() => {
  const navigate = useNavigate()
  const space = useSpaces_activeSpace()
  const count = useSpaces_countById(space?.id)

  const { openDialog } = useDialog()

  const [searchParams] = useSearchParams()
  const removeQueryParam = useRemoveQueryParam()

  const [edit, setEdit] = useState(!!searchParams.get('edit'))

  const [name, setName] = useState(space?.name)
  const [description, setDescription] = useState(space?.description)
  const [banner, setBanner] = useState(space?.banner ? `http://localhost:8090/api/files/spaces/${space.id}/${space.banner}` : null)
  const [icon, setIcon] = useState(space?.icon ? `http://localhost:8090/api/files/spaces/${space.id}/${space.icon}` : null)

  const [bannerFile, setBannerFile] = useState(null)
  const [iconFile, setIconFile] = useState(null)

  useEffect(() => {
    setName(space?.name)
    setDescription(space?.description)
    setBanner(space?.banner ? `http://localhost:8090/api/files/spaces/${space.id}/${space.banner}` : null)
    setIcon(space?.icon ? `http://localhost:8090/api/files/spaces/${space.id}/${space.icon}` : null)
  }, [space])

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

  return (<>
    <Breadcrumbs />
    <Page>
      <Box width='100%' py={.5}>
        {
            edit
              ? <Box width='100%' mt={.5}>
                  <Gap disableWrap>
                    <Gap>
                      <Gap disableWrap>
                        {
                          icon && <Box width={10}><FileDrop 
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
                          </Box>
                        }
                        {
                          banner && <FileDrop 
                            onFileDrop={files => {
                              const file = files?.[0]
                              if (file) {
                                setBannerFile(file)
                                setBanner(URL.createObjectURL(file))
                              }
                            }}
                          >
                            <AspectRatio
                              ratio={4/1}
                              backgroundSrc={banner}
                              coverBackground
                              borderRadius={1}
                            />
                          </FileDrop>
                        }
                      </Gap>
                     
                      <Gap disableWrap>
                        <Box width={10}>
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
                        </Box>
                       
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
                      </Gap>
                       
                      <TextInput
                        value={name}
                        onChange={val => setName(val)}
                        autoFocus
                        placeholder='Name'
                        onEnter={handleUpdate}
                        compact
                      />
                      <RichTextEditor
                        outline
                        px={1}
                        placeholder='Description'
                        value={description}
                        onChange={val => setDescription(val)}
                      />
                    </Gap>
                    <Box width='var(--F_Input_Height)' wrap>
                      <Gap>
                        <Button
                          icon='save'
                          iconPrefix='fas'
                          square
                          onClick={handleUpdate}
                          compact
                        />
                        <Button
                          icon='times'
                          iconPrefix='fas'
                          square
                          minimal
                          onClick={handleCancelEdit}
                          compact
                        />
                      </Gap>
                    </Box>
                  </Gap>
                </Box>
              : <ContextMenu
                  dropdownProps={{
                    items: dropdownItems
                  }}
                >
                  {
                    banner && <AspectRatio
                      ratio={4/1}
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
    </Page>
  </>)
})
