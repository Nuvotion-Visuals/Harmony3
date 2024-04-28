import { Box, TextInput } from '@avsync.live/formation'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSpaces_activeSpaceId, useSpaces_currentUserId } from 'redux-tk/spaces/hooks'
import { pb } from 'redux-tk/pocketbase'

interface CreatechannelProps {
  groupId: string | null
}

export function CreateChannel({ groupId }: CreatechannelProps) {
  const userId = useSpaces_currentUserId()
  const navigate = useNavigate()
  const activeSpaceId = useSpaces_activeSpaceId()
  
  const [channelName, setChannelName] = useState('')

  async function handleCreatechannel() {
    if (!userId || !groupId) return
    setChannelName('')
    const data = { name: channelName, userid: userId, groupid: groupId }
    try {
      const response = await pb.collection('channels').create(data)
      navigate(`/spaces/${activeSpaceId}/groups/${groupId}/channels/${response.id}`)
    } 
    catch (error) {
      console.error('Failed to create channel:', error)
      alert('Error creating channel. Check console for details.')
    }
  }

  return (
    <Box width='100%'>
      <TextInput
        value={channelName}
        onChange={val => setChannelName(val)}
        compact
        secondaryIcon={channelName ? 'arrow-right' : undefined}
        iconPrefix='fas'
        secondaryOnClick={handleCreatechannel}
        onEnter={handleCreatechannel}
        placeholder='Add channel'
        hideOutline
      />
    </Box>
    // <div>
    //   <input
    //     type="text"
    //     value={channelName}
    //     onChange={e => setChannelName(e.target.value)}
    //     placeholder="channel Name"
    //     disabled={!groupId}
    //   />
    //   <textarea
    //     value={channelDescription}
    //     onChange={e => setChannelDescription(e.target.value)}
    //     placeholder="Channel Description"
    //     disabled={!groupId}
    //   />
    //   <button onClick={} disabled={!groupId}>Create channel</button>
    // </div>
  )
}
