import { Box, TextInput } from '@avsync.live/formation'
import React, { useState } from 'react'
import { useSpaces_currentUserId } from 'redux-tk/spaces/hooks'
import { pb } from 'redux-tk/pocketbase'

interface CreateMessageProps {
  threadId: string | null
}

export function CreateMessage({ threadId }: CreateMessageProps) {
  const userId = useSpaces_currentUserId()
  const [messageText, setMessageText] = useState('')

  async function handleCreateMessage() {
    if (!userId || !threadId || !messageText.trim()) return
    const data = { text: messageText, userid: userId, threadid: threadId }
    try {
      await pb.collection('messages').create(data)
      setMessageText('') // Clear the input field after sending the message
    } catch (error) {
      console.error('Failed to create message:', error)
      alert('Error creating message. Check console for details.')
    }
  }

  return (
    <Box width='100%'>
      <TextInput
        value={messageText}
        onChange={val => setMessageText(val)}
        compact
        secondaryIcon='arrow-right'
        iconPrefix='fas'
        secondaryOnClick={handleCreateMessage}
        onEnter={handleCreateMessage}
        placeholder='Message Text'
        hideOutline
        disabled={!threadId}
      />
    </Box>
  )
}
