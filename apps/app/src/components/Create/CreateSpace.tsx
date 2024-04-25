import { Gap, TextInput, Button } from '@avsync.live/formation'
import React, { useState } from 'react'
import { useHarmony_currentUserId } from 'redux-tk/harmony/hooks'
import { pb } from 'redux-tk/pocketbase'

interface CreateSpaceProps {
  // empty props for now
}

export function CreateSpace({}: CreateSpaceProps) {
  const userId = useHarmony_currentUserId()
  const [spaceName, setSpaceName] = useState('')
  const [spaceDescription, setSpaceDescription] = useState('')

  async function handleCreateSpace() {
    if (!userId) return
    setSpaceName('')
    setSpaceDescription('')
    const data = { name: spaceName, description: spaceDescription, userid: userId }
    try {
      await pb.collection('spaces').create(data)
      
    } 
    catch (error) {
      console.error('Failed to create space:', error)
      alert('Error creating space. Check console for details.')
    }
  }

  return (
    <Gap>
      <TextInput
        value={spaceName}
        onChange={val => setSpaceName(val)}
        compact
        placeholder="Space Name"
        secondaryIcon='arrow-right'
        secondaryOnClick={handleCreateSpace}
        onEnter={handleCreateSpace}
        hideOutline
      />
    </Gap>
  )
}
