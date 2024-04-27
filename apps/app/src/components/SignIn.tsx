import { useState } from 'react'
import PocketBase from 'pocketbase'
import { Auth, Button, Gap, TextInput, Notification, Item } from '@avsync.live/formation'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Link } from './Util/Link'

const pb = new PocketBase('http://localhost:8090')

export function SignIn() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSignIn = async () => {
    if (!email || !password) return
    setError('') // Clear previous errors before attempting
    try {
      await pb.collection('users').authWithPassword(
        email,
        password
      )
      if (pb.authStore.isValid) {
        navigate('/')
      }
      else {
        setError('Authentication failed')
      }
    }
    catch (e) {
      const errorData = e?.response?.data || {}
      const identityError = errorData?.identity?.message
      const passwordError = errorData?.password?.message

      if (identityError || passwordError) {
        setError(identityError || passwordError)
      } 
      else {
        setError('Authentication failed')
      }
      console.log(JSON.stringify(e))
    }
  }

  return (
    <Auth
      title='Sign In'
      logoSrc='/cute-harmony.png'
      height='100vh'
    >
      <form onSubmit={e => e.preventDefault()}>
        <Gap gap={.75}>
          <TextInput
            value={email}
            hero
            label='Email'
            type='Email'
            onChange={val => setEmail(val)}
            icon='envelope'
            autoFocus
          />
          <TextInput
            value={password}
            hero
            label='Password'
            type='password'
            onChange={val => setPassword(val)}
            icon='lock'
            spellCheck={true}
            autoComplete='new-password'
            onEnter={handleSignIn}
          />
          {
            error && <Notification type='error' iconPrefix='fas'>
              { error }
            </Notification>
          }
          <Button
            text='Sign in'
            expand
            primary={!!email && !!password}
            disabled={!email || !password}
            onClick={handleSignIn}
          />

          <S.Link>
            <Link href='/sign-up'>
              Don't have an account? Sign up
            </Link>
          </S.Link>
        </Gap>
      </form>
    </Auth>
 
  )
}

export const S = {
  Link: styled.div`
    width: 100%;
    font-size: var(--F_Font_Size);
    color: var(--F_Font_Color_Label);
    text-decoration: underline;
    text-align: center;
    display: flex;
    justify-content: center;
    * {
      color: var(--F_Font_Color_Label);
    }
  `
}
