import React, { memo, useEffect, useState } from 'react'
import { Item, Dropdown, TextInput, Button, Box, Gap, ItemProps, ContextMenu } from '@avsync.live/formation'
import { pb } from 'redux-tk/pocketbase'

interface Props {
  channel: any
}

export const ChannelHeader = memo(({ channel }: Props) => {
  const [edit, setEdit] = useState(false)
  const [editName, setEditName] = useState(channel?.name)
  const [editDescription, setEditDescription] = useState(channel?.description)

  useEffect(() => {
    setEditName(channel?.name)
    setEditDescription(channel?.description)
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
    try {
      await pb.collection('channels').update(channel.id, {
        name: editName,
        description: editDescription
      })
      setEdit(false)
      console.log('Channel updated')
    } 
    catch (error) {
      console.error('Failed to update channel:', error)
      alert('Failed to update channel')
    }
  }

  const dropdownItems = [
    {
      icon: 'edit',
      iconPrefix: 'fas',
      compact: true,
      text: 'Edit',
      onClick: () => setEdit(true)
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
    <Box width='100%' py={1}>
      {
          edit
            ? <Box width='100%' mt={.5}>
                <Gap disableWrap>
                  <Gap >
                    <TextInput
                      value={editName}
                      onChange={val => setEditName(val)}
                      autoFocus
                      placeholder='Name'
                      onEnter={handleUpdate}
                      compact
                    />
                    <TextInput
                      value={editDescription}
                      onChange={val => setEditDescription(val)}
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
                        onClick={() => handleUpdate()}
                        compact
                      />
                      <Button
                        icon='times'
                        iconPrefix='fas'
                        square
                        minimal
                        onClick={() => setEdit(false)}
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
                <Item
                  pageTitle={edit ? 'Edit Channel' : channel?.name}
                  text={channel?.description}
                  absoluteRightChildren
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
              </ContextMenu> 
      }
    </Box>
  )
})
