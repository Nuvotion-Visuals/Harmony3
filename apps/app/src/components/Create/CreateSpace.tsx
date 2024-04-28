import { Gap, TextInput, Button, RichTextEditor, Page, Box, Item } from '@avsync.live/formation'
import { SpaceSuggestions } from 'components/App/Suggestions/SpaceSuggestions'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSpaces_currentUserId } from 'redux-tk/spaces/hooks'
import { pb } from 'redux-tk/pocketbase'

export const CreateSpace = () => {
  const navigate = useNavigate()
  const userId = useSpaces_currentUserId()
  const [name, setName] = useState('')
  const [description, setSpaceDescription] = useState('')

  async function handleCreateSpace() {
    if (!userId) return
    setName('')
    setSpaceDescription('')
    const data = { name, description, userid: userId }
    try {
      const response = await pb.collection('spaces').create(data)
      navigate(`/spaces/${response.id}`)
    } 
    catch (error) {
      console.error('Failed to create space:', error)
      alert('Error creating space. Check console for details.')
    }
  }

  return (
    <Box mt={1}>
      <Page>
        <Gap>
          <Item
            pageTitle='Create Space'
          />
          <Gap disableWrap>
            <TextInput
              value={name}
              onChange={val => setName(val)}
              compact
              placeholder='Space Name'
              onEnter={handleCreateSpace}
              autoFocus
            />
            <Button
              text='Create'
              icon='arrow-right'
              iconPrefix='fas'
              compact
              primary={name !== ''}
              disabled={name === ''}
              onClick={handleCreateSpace}
            />
          </Gap>
          
          <RichTextEditor
            value={description}
            onChange={val => setSpaceDescription(val)}
            outline
            px={1}
            placeholder='Description'
          />

          <SpaceSuggestions />
        </Gap>
      </Page>
    </Box>
  )
}
