import { Box, TextInput } from '@avsync.live/formation'
import React, { useState } from 'react'
import { useHarmony_currentUserId } from 'redux-tk/harmony/hooks'
import { pb } from 'redux-tk/pocketbase'

interface CreateGroupProps {
  spaceId: string | null
}

export function CreateGroup({ spaceId }: CreateGroupProps) {
  const userId = useHarmony_currentUserId()
  
  const [groupName, setGroupName] = useState('')
  // const [groupDescription, setGroupDescription] = useState('') // Temporarily commented out

  async function handleCreateGroup() {
    if (!userId || !spaceId) return
    setGroupName('')
    const data = { name: groupName, userid: userId, spaceid: spaceId }
    try {
      await pb.collection('groups').create(data)
    } 
    catch (error) {
      console.error('Failed to create group:', error)
      alert('Error creating group. Check console for details.')
    }
  }

  return (
    <Box width='100%'>
      <TextInput
        value={groupName}
        onChange={val => setGroupName(val)}
        compact
        secondaryIcon='arrow-right'
        iconPrefix='fas'
        secondaryOnClick={handleCreateGroup}
        onEnter={handleCreateGroup}
        placeholder='Add group'
        hideOutline
        disabled={!spaceId}
      />
    </Box>
  )
}
