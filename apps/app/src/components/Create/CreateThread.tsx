import React, { useState } from 'react'

interface CreateThreadProps {
  userId: string | null
  channelId: string | null
  pb: any
}

export function CreateThread({ userId, channelId, pb }: CreateThreadProps) {
  const [threadName, setthreadName] = useState('')
  const [threadDescription, setthreadDescription] = useState('')

  async function handleCreateThread() {
    if (!userId || !channelId) return
    const data = { name: threadName, content: threadDescription, userid: userId, channelid: channelId }
    try {
      const thread = await pb.collection('threads').create(data)
    } catch (error) {
      console.error('Failed to create thread:', error)
      alert('Error creating thread. Check console for details.')
    }
  }

  return (
    <div>
      <input
        type="text"
        value={threadName}
        onChange={e => setthreadName(e.target.value)}
        placeholder="Thread Name"
        disabled={!channelId}
      />
      <textarea
        value={threadDescription}
        onChange={e => setthreadDescription(e.target.value)}
        placeholder="Thread Description"
        disabled={!channelId}
      />
      <button onClick={handleCreateThread} disabled={!channelId}>Create Thread</button>
    </div>
  )
}
