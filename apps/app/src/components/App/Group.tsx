import React, { memo, useCallback, useEffect, useState } from 'react'
import { Item, Dropdown, TextInput, Button, Box, Gap, ItemProps, ContextMenu, Page, StyleHTML, markdownToHTML, RichTextEditor, AspectRatio, FileUpload, LineBreak, FileDrop, useDialog } from '@avsync.live/formation'
import { pb } from 'redux-tk/pocketbase'
import { useSpaces_activeGroup, useSpaces_activeSpaceId, useSpaces_countByGroupId, useSpaces_setActiveChannelId } from 'redux-tk/spaces/hooks'
import { ChannelSuggestions } from 'components/App/Suggestions/ChannelSuggestions'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useRemoveQueryParam } from 'utils/removeEditQuery'
import { Breadcrumbs } from './Breadcrumbs'
import { ConfirmationMessage } from 'components/Util/ConfirmationMessage'
import { Count } from './Count'
import { ImageDropTarget } from 'components/Util/ImageDrop'

export const Group = memo(() => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const removeQueryParam = useRemoveQueryParam()

  const { openDialog } = useDialog()

  const activeSpaceId = useSpaces_activeSpaceId()
  const setActiveChannelId = useSpaces_setActiveChannelId()
  const group = useSpaces_activeGroup()
  const count = useSpaces_countByGroupId(group?.id)

  useEffect(() => {
    setActiveChannelId(null)
  }, [])

  const [edit, setEdit] = useState(!!searchParams.get('edit'))

  const [name, setName] = useState(group?.name)
  const [description, setDescription] = useState(group?.description)
  const [banner, setBanner] = useState(group?.banner ? `http://localhost:8090/api/files/groups/${group.id}/${group.banner}` : null)

  const [file, setFile] = useState(null)

  useEffect(() => {
    setName(group?.name)
    setDescription(group?.description)
    setBanner(group?.banner ? `http://localhost:8090/api/files/groups/${group.id}/${group.banner}` : null)
  }, [group])

  const handleDelete = async () => {
    try {
      await pb.collection('groups').delete(group.id)
      console.log('Group deleted')
      navigate(`/spaces/${activeSpaceId}`)
    } 
    catch (error) {
      console.error('Failed to delete group:', error)
      alert('Failed to delete group')
    }
  }

  const handleUpdate = async () => {
    const formData = new FormData()
    if (file) {
      formData.append('banner', file)
    }
    formData.append('name', name)
    formData.append('description', description)

    try {
      await pb.collection('groups').update(group.id, formData)
      setEdit(false)
      removeQueryParam('edit')
      console.log('Group updated')
    } 
    catch (error) {
      console.error('Failed to update group:', error)
      alert('Failed to update group')
    }
  }

  const handleCancelEdit = useCallback(() => {
    setName(group?.name)
    setDescription(group?.description)
    setBanner(group?.banner ? `http://localhost:8090/api/files/groups/${group.id}/${group.banner}` : null)
    setEdit(false)
    removeQueryParam('edit')
  }, [group])

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
            message='Are you sure you want to delete this group?'
            name={group?.name}
            warning={`${count?.channels} channels, ${count?.threads} threads, and ${count?.messages} messages will also be deleted.`}
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
                    <Gap >
                      {
                        banner && <ImageDropTarget
                          onFileConverted={(file) => {
                            setFile(file)
                            setBanner(URL.createObjectURL(file))
                          }}
                        >
                          <FileDrop 
                            onFileDrop={files => {
                              const file = files?.[0]
                              if (file) {
                                setFile(file)
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
                        </ImageDropTarget>
                      }
                      
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
                            setFile(file)
                            setBanner(URL.createObjectURL(file))
                          }
                        }}
                      />
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
                    pageTitle={edit ? 'Edit Group' : group?.name}
                    absoluteRightChildren
                    small
                  >
                    <Box height={'100%'}>
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

                  <ChannelSuggestions />

                  <StyleHTML>
                    <div dangerouslySetInnerHTML={{ __html: markdownToHTML(description || '') || '' }} />
                  </StyleHTML>
                </ContextMenu> 
        }
      </Box>
    </Page>
  </>)
})
