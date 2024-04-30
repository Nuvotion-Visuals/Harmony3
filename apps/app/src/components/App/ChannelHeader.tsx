import React, { memo, useCallback, useEffect, useState } from 'react'
import { Item, Dropdown, TextInput, Button, Box, Gap, ItemProps, ContextMenu, Page, FileUpload, AspectRatio, LineBreak, FileDrop, useDialog } from '@avsync.live/formation'
import { pb } from 'redux-tk/pocketbase'
import { ThreadSuggestions } from 'components/App/Suggestions/ThreadSuggestions'
import { useSearchParams } from 'react-router-dom'
import { useRemoveQueryParam } from 'utils/removeEditQuery'
import { useSpaces_countByChannelId } from 'redux-tk/spaces/hooks'
import { Count } from './Count'
import { ConfirmationMessage } from 'components/Util/ConfirmationMessage'
import { ImageDropTarget } from 'components/Util/ImageDrop'
import { ImageSuggestions } from './Suggestions/ImageSuggestions'

interface Props {
  channel: any
}

export const ChannelHeader = memo(({ channel }: Props) => {
  const [searchParams] = useSearchParams()
  const removeQueryParam = useRemoveQueryParam()
  const count = useSpaces_countByChannelId(channel?.id)

  const { openDialog } = useDialog()

  const [edit, setEdit] = useState(!!searchParams.get('edit'))

  const [name, setName] = useState(channel?.name)
  const [description, setDescription] = useState(channel?.description)
  const [banner, setBanner] = useState(channel?.banner ? `http://localhost:8090/api/files/channels/${channel.id}/${channel.banner}` : null)

  const [file, setFile] = useState(null)

  useEffect(() => {
    setName(channel?.name)
    setDescription(channel?.description)
    setBanner(channel?.banner ? `http://localhost:8090/api/files/channels/${channel.id}/${channel.banner}` : null)
  }, [channel])

  const handleDelete = async () => {
    try {
      await pb.collection('channels').delete(channel.id)
      console.log('Channel deleted')
    } 
    catch (error) {
      console.error('Failed to delete channel:', error)
      alert('Failed to delete channel')
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
      await pb.collection('channels').update(channel.id, formData)
      setEdit(false)
      removeQueryParam('edit')
      console.log('Channel updated')
    } 
    catch (error) {
      console.error('Failed to update channel:', error)
      alert('Failed to update channel')
    }
  }

  const handleCancelEdit = useCallback(() => {
    setName(channel?.name)
    setDescription(channel?.description)
    setBanner(channel?.banner ? `http://localhost:8090/api/files/channels/${channel.id}/${channel.banner}` : null)
    setEdit(false)
    removeQueryParam('edit')
  }, [channel])

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
            message='Are you sure you want to delete this channel?'
            name={channel?.name}
            warning={`${count?.threads} threads, and ${count?.messages} messages will also be deleted.`}
          />,
          callback: shouldDelete => { if (shouldDelete) handleDelete() }
        })
      },
    }
  ] as ItemProps[]

  return (
    <Page noPadding>
      <Box width='100%' py={.5}>
        {
            edit
              ? <Box width='100%' mt={.5}>
                  <Gap disableWrap>
                    <Gap>
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

                      <ImageSuggestions 
                        placeholder='Instructions'
                        prompt={`
                          Channel name: ${channel?.name}
                          Description: ${channel?.description}
                        `}
                        onFileReady={(file) => {
                          setFile(file)
                          setBanner(URL.createObjectURL(file))
                        }}
                      >
                        <FileUpload
                          minimal
                          buttonProps={{
                            icon: 'upload',
                            iconPrefix: 'fas',
                            text: 'Upload banner',
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
                        <Button
                          icon='times'
                          iconPrefix='fas'
                          square
                          onClick={handleCancelEdit}
                          hero
                        />
                        <Button
                          icon='check'
                          primary
                          iconPrefix='fas'
                          square
                          onClick={handleUpdate}
                          hero
                        />
                     </Gap>
                    
                      <TextInput
                        value={description}
                        onChange={val => setDescription(val)}
                        label='Description'
                        onEnter={handleUpdate}
                        hero
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
                      ratio={4/1}
                      backgroundSrc={banner}
                      coverBackground
                      borderRadius={1}
                    />
                  }
                  <Item
                    pageTitle={channel?.name}
                    absoluteRightChildren
                    small
                  >
                    <Box height={'100%'}>
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
                  {
                    channel?.description && <Item
                      text={channel?.description}
                    />
                  }
                </ContextMenu> 
        }
      </Box>
      {
        !edit && <ThreadSuggestions />
      }
    </Page>
  )
})
