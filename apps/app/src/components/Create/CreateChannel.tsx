import React, { useState } from 'react'

interface CreatechannelProps {
  userId: string | null
  groupId: string | null
  pb: any
}

export function CreateChannel({ userId, groupId, pb }: CreatechannelProps) {
  const [channelName, setchannelName] = useState('')
  const [channelDescription, setChannelDescription] = useState('')

  async function handleCreatechannel() {
    if (!userId || !groupId) return
    const data = { name: channelName, content: channelDescription, userid: userId, groupid: groupId }
    try {
      const channel = await pb.collection('channels').create(data)
    } catch (error) {
      console.error('Failed to create channel:', error)
      alert('Error creating channel. Check console for details.')
    }
  }

  return (
    <div>
      <input
        type="text"
        value={channelName}
        onChange={e => setchannelName(e.target.value)}
        placeholder="channel Name"
        disabled={!groupId}
      />
      <textarea
        value={channelDescription}
        onChange={e => setChannelDescription(e.target.value)}
        placeholder="Channel Description"
        disabled={!groupId}
      />
      <button onClick={handleCreatechannel} disabled={!groupId}>Create channel</button>
    </div>
  )
}
