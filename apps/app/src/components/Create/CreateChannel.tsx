import { Box, TextInput } from '@avsync.live/formation'
import React, { useState } from 'react'
import { useHarmony_currentUserId } from 'redux-tk/harmony/hooks'
import { pb } from 'redux-tk/pocketbase'

interface CreatechannelProps {
  groupId: string | null
}

export function CreateChannel({ groupId }: CreatechannelProps) {
  const userId = useHarmony_currentUserId()
  
  const [channelName, setChannelName] = useState('')
  const [channelDescription, setChannelDescription] = useState('')

  async function handleCreatechannel() {
    if (!userId || !groupId) return
    setChannelName('')
    const data = { name: channelName, content: channelDescription, userid: userId, groupid: groupId }
    try {
      await pb.collection('channels').create(data)
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
        secondaryIcon='arrow-right'
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
