import React, { useState } from 'react'

interface CreateGroupProps {
  userId: string | null
  spaceId: string | null
  pb: any
}

export function CreateGroup({ userId, spaceId, pb }: CreateGroupProps) {
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')

  async function handleCreateGroup() {
    if (!userId || !spaceId) return
    const data = { name: groupName, description: groupDescription, userid: userId, spaceid: spaceId }
    try {
      const group = await pb.collection('groups').create(data)
    } catch (error) {
      console.error('Failed to create group:', error)
      alert('Error creating group. Check console for details.')
    }
  }

  return (
    <div>
      <input
        type="text"
        value={groupName}
        onChange={e => setGroupName(e.target.value)}
        placeholder="Group Name"
        disabled={!spaceId}
      />
      <textarea
        value={groupDescription}
        onChange={e => setGroupDescription(e.target.value)}
        placeholder="Group Description"
        disabled={!spaceId}
      />
      <button onClick={handleCreateGroup} disabled={!spaceId}>Create Group</button>
    </div>
  )
}
