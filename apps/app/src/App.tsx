import { NavSpaces } from '@avsync.live/formation'
import { SpaceSidebar } from './components/App/SpaceSidebar'
import { Channel } from 'components/App/Channel'
import { useHarmony_setCurrentUser } from 'redux-tk/harmony/hooks'
import { useEffect } from 'react'
import { pb } from 'redux-tk/pocketbase'
import { UsersResponse } from 'redux-tk/pocketbase-types'

interface Props {
  children: React.ReactNode
}

export const App = ({ children }: Props) => {

  const setCurrentUser = useHarmony_setCurrentUser()

  useEffect(() => {
    setCurrentUser(pb.authStore.model as UsersResponse | null)
  }, [])

  const FirstPage = () => {
    return <SpaceSidebar />
  }

  return (
    <>
      <NavSpaces
        dropdownOptions={[]}
        disableTablet
        activeSwipeIndex={0}
        onSwipe={index => console.log(index)}
        spaces={[]}
        activeSpaceIndex={0}
        onSetActiveSpacesIndex={index => console.log(index)}
        channels={[]}
        sidebarWidth='380px'
        firstPage={<FirstPage />}
        secondPage={<Channel />}
        thirdPage={<>{children}</>}
        navsPrimary={[
       
        ]}
      />
     
      {/* <Realtime /> */}
    </>
  )
}
