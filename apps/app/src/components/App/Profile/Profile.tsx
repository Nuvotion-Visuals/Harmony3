import { Box, Button, Gap, Item, Page, TextInput, Notification } from '@avsync.live/formation'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSpaces_currentUser } from 'redux-tk/spaces/hooks'
import { pb } from 'redux-tk/pocketbase'

export const Profile = () => {
  const currentUser = useSpaces_currentUser()
  const navigate = useNavigate()

  const [updated, setUpdated] = useState(false)

  const [name, setName] = useState(currentUser?.name)
  const [email, setEmail] = useState(currentUser?.email)

  useEffect(() => {
    setName(currentUser?.name)
    setEmail(currentUser?.email)
  }, [currentUser])

  const handleUpdate = async () => {
    try {
      await pb.collection('users').update(currentUser?.id, {
        name,
        email
      })
      setUpdated(true)
    } 
    catch (error) {
      console.error('Failed to update user:', error)
      alert('Failed to update user')
    }
  }

  const handleSignOut = () => {
    pb.authStore.clear()
    navigate('/sign-in')
  }

  return <Page>
    <Item
      pageTitle='Profile'
      absoluteRightChildren
    >
      <Box height='100%'>
        <Button
          icon='sign-out-alt'
          iconPrefix='fas'
          text='Sign out'
          minimal
          compact
          onClick={handleSignOut}
        />
      </Box>
    </Item>
    <Gap>
      <TextInput
        label={'Name'}
        value={name}
        onChange={(val => setName(val))}
        hero
        onEnter={handleUpdate}
      />
      <TextInput
        label={'Email'}
        value={email}
        onChange={(val => setEmail(val))}
        hero
        onEnter={handleUpdate}
      />
      <Button
        text='Save'
        icon='check'
        iconPrefix='fas'
        onClick={handleUpdate}
      />
      {
        updated && <Notification type='success' iconPrefix='fas'>
          Updated
        </Notification>
      }
    </Gap>
  </Page>
}