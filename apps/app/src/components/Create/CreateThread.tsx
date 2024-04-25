import { Box, TextInput } from '@avsync.live/formation'
import React, { useState } from 'react'
import { useHarmony_currentUserId } from 'redux-tk/harmony/hooks'
import { pb } from 'redux-tk/pocketbase'

interface CreateThreadProps {
  channelId: string | null
}

export function CreateThread({ channelId }: CreateThreadProps) {
  const userId = useHarmony_currentUserId()
  const [threadName, setThreadName] = useState('')
  const [threadDescription, setThreadDescription] = useState('')

  async function handleCreateThread() {
    if (!userId || !channelId) return
    setThreadName('')
    const data = { name: threadName, content: threadDescription, userid: userId, channelid: channelId }
    try {
      await pb.collection('threads').create(data)
      setThreadDescription('')
    } 
    catch (error) {
      console.error('Failed to create thread:', error)
      alert('Error creating thread. Check console for details.')
    }
  }

  return (
    <Box width='100%'>
      <TextInput
        value={threadName}
        onChange={val => setThreadName(val)}
        compact
        secondaryIcon='arrow-right'
        iconPrefix='fas'
        secondaryOnClick={handleCreateThread}
        placeholder='Thread Name'
        hideOutline
        disabled={!channelId}
        onEnter={handleCreateThread}
      />
      {/* Temporarily commented out as per your previous example
      <textarea
        value={threadDescription}
        onChange={e => setThreadDescription(e.target.value)}
        placeholder="Thread Description"
        disabled={!channelId}
      />
      */}
    </Box>
  )
}
