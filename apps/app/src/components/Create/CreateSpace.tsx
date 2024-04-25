import { Gap } from '@avsync.live/formation'
import React, { useState } from 'react'

interface CreateSpaceProps {
  userId: string | null
  pb: any
}

export function CreateSpace({ userId, pb }: CreateSpaceProps) {
  const [spaceName, setSpaceName] = useState('')
  const [spaceDescription, setSpaceDescription] = useState('')

  async function handleCreateSpace() {
    if (!userId) return
    const data = { name: spaceName, description: spaceDescription, userid: userId }
    try {
      const space = await pb.collection('spaces').create(data)
    } catch (error) {
      console.error('Failed to create space:', error)
      alert('Error creating space. Check console for details.')
    }
  }

  return (
    <Gap>
      <input
        type="text"
        value={spaceName}
        onChange={e => setSpaceName(e.target.value)}
        placeholder="Space Name"
      />
      <textarea
        value={spaceDescription}
        onChange={e => setSpaceDescription(e.target.value)}
        placeholder="Space Description"
      />
      <button onClick={handleCreateSpace} disabled={!userId}>Create Space</button>
    </Gap>
  )
}
