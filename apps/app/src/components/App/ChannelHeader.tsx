import React, { memo, useCallback, useEffect, useState } from 'react'
import { Item, Dropdown, TextInput, Button, Box, Gap, ItemProps, ContextMenu, Page, FileUpload, AspectRatio, LineBreak, FileDrop } from '@avsync.live/formation'
import { pb } from 'redux-tk/pocketbase'
import { ThreadSuggestions } from 'components/App/Suggestions/ThreadSuggestions'

interface Props {
  channel: any
}

export const ChannelHeader = memo(({ channel }: Props) => {
  const [edit, setEdit] = useState(false)

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
      onClick: handleDelete
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
                        banner && <FileDrop 
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
                      <TextInput
                        value={description}
                        onChange={val => setDescription(val)}
                        placeholder='Description'
                        onEnter={handleUpdate}
                        compact
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
                    pageTitle={channel?.name}
                    absoluteRightChildren
                    small
                  >
                    <Box height={'100%'}>
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
      <ThreadSuggestions />
    </Page>
  )
})
