import React, { useState } from 'react'

interface CreateMessageProps {
  userId: string | null
  threadId: string | null
  pb: any
}

export function CreateMessage({ userId, threadId, pb }: CreateMessageProps) {
  const [messageText, setMessageText] = useState('')

  async function handleCreateMessage() {
    if (!userId || !threadId || !messageText.trim()) return
    const data = { text: messageText, userid: userId, threadid: threadId }
    try {
      await pb.collection('messages').create(data)
    } catch (error) {
      console.error('Failed to create message:', error)
      alert('Error creating message. Check console for details.')
    }
  }

  return (
    <div>
      <textarea
        value={messageText}
        onChange={e => setMessageText(e.target.value)}
        placeholder="Message Text"
        disabled={!threadId}
      />
      <button onClick={handleCreateMessage} disabled={!threadId || !messageText.trim()}>Create Message</button>
    </div>
  )
}
