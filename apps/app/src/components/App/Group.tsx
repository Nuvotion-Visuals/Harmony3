import React, { memo, useCallback, useEffect, useState } from 'react'
import { Item, Dropdown, TextInput, Button, Box, Gap, ItemProps, ContextMenu, Page, StyleHTML, markdownToHTML, RichTextEditor } from '@avsync.live/formation'
import { pb } from 'redux-tk/pocketbase'
import { useHarmony_activeGroup, useHarmony_activeSpaceId } from 'redux-tk/harmony/hooks'
import { ChannelSuggestions } from 'components/App/Suggestions/ChannelSuggestions'
import { useNavigate } from 'react-router-dom'

export const Group = memo(() => {
  const navigate = useNavigate()
  const activeSpaceId = useHarmony_activeSpaceId()
  const group = useHarmony_activeGroup()

  const [edit, setEdit] = useState(false)

  const [name, setName] = useState(group?.name)
  const [description, setDescription] = useState(group?.description)

  useEffect(() => {
    setName(group?.name)
    setDescription(group?.description)
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
    try {
      await pb.collection('groups').update(group.id, {
        name,
        description
      })
      setEdit(false)
      console.log('Group updated')
    } 
    catch (error) {
      console.error('Failed to update group:', error)
      alert('Failed to update group')
    }
  }

  const handleCancelEdit = useCallback(() => {
    setName(group.name)
    setDescription(group.description)
    setEdit(false)
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
      icon: 'trash-alt',
      iconPrefix: 'fas',
      compact: true,
      text: 'Delete',
      onClick: handleDelete
    }
  ] as ItemProps[]

  return (
    <Page>
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
                  <Item
                    pageTitle={edit ? 'Edit Group' : group?.name}
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

                  <ChannelSuggestions />

                  <StyleHTML>
                    <div dangerouslySetInnerHTML={{ __html: markdownToHTML(description || '') || '' }} />
                  </StyleHTML>
                </ContextMenu> 
        }
      </Box>
    </Page>
  )
})
