import { useState } from 'react'
import PocketBase from 'pocketbase'

const pb = new PocketBase('http://localhost:8090')

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const [userInfo, setUserInfo] = useState('')

  const handleSignUp = async () => {
    await pb.collection('users').authWithPassword(
      email,
      password,
    )
    // after the above you can also access the auth data from the authStore
    console.log(pb.authStore.isValid)
    console.log(pb.authStore.token)
    console.log(pb.authStore.model)
    setUserInfo(pb.authStore.model?.email)
    pb.authStore.clear()
  }

  return (
    <div>
      <h1>Sign In</h1>
      <input
        type='email'
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder='Email'
      />
      <input
        type='password'
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder='Password'
      />
      {error && <p>{error}</p>}
      <button onClick={handleSignUp}>Sign In</button>
      {userInfo && `Welcome ${userInfo}`}
    </div>
  )
}

export const S = {
  // Add any styled components here if needed
}
