import React, { memo, useCallback, useEffect, useState } from 'react'
import { Item, Dropdown, TextInput, Button, Box, Gap, ItemProps, ContextMenu, Page } from '@avsync.live/formation'
import { pb } from 'redux-tk/pocketbase'
import { ChannelSuggestThreads } from './ChannelSuggestThreads'

interface Props {
  channel: any
}

export const ChannelHeader = memo(({ channel }: Props) => {
  const [edit, setEdit] = useState(false)

  const [name, setName] = useState(channel?.name)
  const [description, setDescription] = useState(channel?.description)

  useEffect(() => {
    setName(channel?.name)
    setDescription(channel?.description)
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
        name,
        description
      })
      setEdit(false)
      console.log('Channel updated')
    } 
    catch (error) {
      console.error('Failed to update channel:', error)
      alert('Failed to update channel')
    }
  }

  const handleCancelEdit = useCallback(() => {
    setName(channel.name)
    setDescription(channel.description)
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
                    <Gap >
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
      <ChannelSuggestThreads />
    </Page>
  )
})
