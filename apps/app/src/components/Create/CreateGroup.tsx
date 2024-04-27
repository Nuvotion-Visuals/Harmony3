import { Box, TextInput } from '@avsync.live/formation'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHarmony_activeSpaceId, useHarmony_currentUserId } from 'redux-tk/harmony/hooks'
import { pb } from 'redux-tk/pocketbase'

interface CreateGroupProps {
  spaceId: string | null
}

export function CreateGroup({ spaceId }: CreateGroupProps) {
  const userId = useHarmony_currentUserId()
  const activeSpaceId = useHarmony_activeSpaceId()
  const navigate = useNavigate()
  
  const [groupName, setGroupName] = useState('')
  // const [groupDescription, setGroupDescription] = useState('') // Temporarily commented out

  async function handleCreateGroup() {
    if (!userId || !spaceId) return
    setGroupName('')
    const data = { name: groupName, userid: userId, spaceid: spaceId }
    try {
      const response = await pb.collection('groups').create(data)
      navigate(`/spaces/${activeSpaceId}/groups/${response.id}`)
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
        secondaryIcon={groupName ? 'arrow-right' : undefined}
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
