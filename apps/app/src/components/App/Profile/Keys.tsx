import { Button, Gap, TextInput, Notification } from '@avsync.live/formation'
import { useEffect, useState } from 'react'
import { pb } from 'redux-tk/pocketbase'
import { useSpaces_currentUser, useSpaces_setCurrentUser } from 'redux-tk/spaces/hooks'

export const Keys = () => {
  const currentUser = useSpaces_currentUser()
  const setCurrentUser = useSpaces_setCurrentUser()

  const [OPENAI_API_KEY, set_OPENAI_API_KEY] = useState('') 
  const [GROQ_API_KEY, set_GROQ_API_KEY] = useState('') 
  const [ANTHROPIC_API_KEY, set_ANTHROPIC_API_KEY] = useState('') 

  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const keys = currentUser?.keys as any
    if (keys) {
      if (keys?.OPENAI_API_KEY) {
        set_OPENAI_API_KEY(keys?.OPENAI_API_KEY)
      }
      if (keys?.GROQ_API_KEY) {
        set_GROQ_API_KEY(keys?.GROQ_API_KEY)
      }
      if (keys?.ANTHROPIC_API_KEY) {
        set_ANTHROPIC_API_KEY(keys?.ANTHROPIC_API_KEY)
      }
    }
  }, [currentUser])

  async function handleUpdate() {
    setSaved(true)
    try {
      console.log(currentUser?.id)
      const response = await pb.collection('users').update(currentUser.id, {
        keys: JSON.stringify({
          OPENAI_API_KEY,
          GROQ_API_KEY,
          ANTHROPIC_API_KEY
        })
      })
      console.log(response)
      setTimeout(() => {
        setSaved(false)
      }, 2000)
    } 
    catch (error) {
      console.error('Failed to update user:', error)
      alert('Error updating user. Check console for details.')
    }
  }

  return (
    <Gap>
      <TextInput
        hero
        label='OpenAI API Key'
        type='password'
        value={OPENAI_API_KEY}
        onChange={val => set_OPENAI_API_KEY(val)}
        canClear={OPENAI_API_KEY !== ''}
      />
      <TextInput
        hero
        label='Groq API Key'
        type='password'
        value={GROQ_API_KEY}
        onChange={val => set_GROQ_API_KEY(val)}
        canClear={GROQ_API_KEY !== ''}
      />
      <TextInput
        hero
        label='Anthropic API Key'
        type='password'
        value={ANTHROPIC_API_KEY}
        onChange={val => set_ANTHROPIC_API_KEY(val)}
        canClear={ANTHROPIC_API_KEY !== ''}
      />
      <Button
        text='Save'
        onClick={() => handleUpdate()}
      />
      {
        saved && <Notification type='success' iconPrefix='fas'>Saved</Notification>
      }
    </Gap>
  )
}