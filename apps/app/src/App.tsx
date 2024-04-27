import { NavSpaces } from '@avsync.live/formation'
import { SpaceSidebar } from './components/App/SpaceSidebar'
import { Channel } from 'components/App/Channel'
import { useHarmony_setCurrentUser } from 'redux-tk/harmony/hooks'
import { useEffect } from 'react'
import { pb } from 'redux-tk/pocketbase'
import { UsersResponse } from 'redux-tk/pocketbase-types'
import { matchPath, useLocation, useParams } from 'react-router-dom'
import SpacesDashboard from 'components/App/SpacesDashboard'
import { Chat } from 'components/App/Chat'
import { CreateSpace } from 'components/Create/CreateSpace'
import { Space } from 'components/App/Space'
import { Group } from 'components/App/Group'

interface Props {
  children: React.ReactNode
}

export const App = ({ children }: Props) => {
  const location = useLocation()

  const setCurrentUser = useHarmony_setCurrentUser()

  useEffect(() => {
    setCurrentUser(pb.authStore.model as UsersResponse | null)
  }, [])


  const FirstPage = () => {
    return <SpaceSidebar />
  }

  const SecondPage = () => {
    const location = useLocation()
  
    // Match for the specific space ID
    const matchSpace = matchPath({ path: "/spaces/:spaceid", end: true }, location.pathname)
    if (matchSpace) {
      return <Space />
    }
  
    // Match for the specific group within a space
    const matchGroup = matchPath({ path: "/spaces/:spaceid/groups/:groupid", end: true }, location.pathname)
    if (matchGroup) {
      return <Group />
    }
  
    switch (location.pathname) {
      case '/spaces/create':
        return <CreateSpace />
      default:
        return <Channel />
    }
  }

  const ThirdPage = () => {
    switch(location.pathname) {
      default:
        return <Chat />
    }
  }

  return (
    <>
      {
        location.pathname === '/'
          ? <SpacesDashboard />
          : <NavSpaces
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
              secondPage={<SecondPage />}
              thirdPage={<>
                {children}
                <ThirdPage />
              </>}
              navsPrimary={[
                {
                  icon: 'diagram-project',
                  iconPrefix: 'fas',
                  title: 'Spaces',
                  href: `/spaces`,
                  active: true
                },
                {
                  icon: 'users',
                  iconPrefix: 'fas',
                  title: 'Personas',
                  href: `/personas`,
                  active: false
                },
                {
                  icon: 'user-circle',
                  iconPrefix: 'fas',
                  title: 'Profile',
                  href: `/login`,
                  active: false
                },
              ]}
            />
      }
    </>
    
  )
}
