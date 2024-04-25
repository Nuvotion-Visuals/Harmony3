import React, { useState } from 'react'

interface CreateThreadProps {
  userId: string | null
  groupId: string | null
  pb: any
}

export function CreateThread({ userId, groupId, pb }: CreateThreadProps) {
  const [threadName, setthreadName] = useState('')
  const [threadDescription, setthreadDescription] = useState('')

  async function handleCreateThread() {
    if (!userId || !groupId) return
    const data = { name: threadName, content: threadDescription, userid: userId, groupid: groupId }
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
        disabled={!groupId}
      />
      <textarea
        value={threadDescription}
        onChange={e => setthreadDescription(e.target.value)}
        placeholder="Thread Description"
        disabled={!groupId}
      />
      <button onClick={handleCreateThread} disabled={!groupId}>Create Thread</button>
    </div>
  )
}
