import { NavSpaces } from '@avsync.live/formation'
import { SpaceSidebar } from './components/App/SpaceSidebar'
import { Channel } from 'components/App/Channel'
import { useSpaces_setCurrentUser } from 'redux-tk/spaces/hooks'
import { useEffect } from 'react'
import { pb } from 'redux-tk/pocketbase'
import { UsersResponse } from 'redux-tk/pocketbase-types'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import SpacesDashboard from 'components/App/SpacesDashboard'
import { QuickChat } from 'components/App/QuickChat'
import { CreateSpace } from 'components/Create/CreateSpace'
import { Space } from 'components/App/Space'
import { Group } from 'components/App/Group'
import { Profile } from 'components/App/Profile'

interface Props {
  children: React.ReactNode
}

export const App = ({ children }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()

  const setCurrentUser = useSpaces_setCurrentUser()

  useEffect(() => {
    const currentUser = pb.authStore.model as UsersResponse | null
    if (!currentUser) {
      navigate('/sign-in')
    }
    else {
      setCurrentUser(currentUser)
    }
  }, [])

  const FirstPage = () => {
    return <SpaceSidebar />
  }

  const SecondPage = () => {
    const location = useLocation()
  
    if (location.pathname === '/profile') {
      return <Profile />
    }

    if (location.pathname === '/spaces/create') {
      return <CreateSpace />
    }

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
      default:
        return <Channel />
    }
  }

  const ThirdPage = () => {
    switch(location.pathname) {
      default:
        return <QuickChat />
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
                  active: location.pathname.includes('/spaces/')
                },
                {
                  icon: 'users',
                  iconPrefix: 'fas',
                  title: 'Personas',
                  href: `/personas`,
                  active: location.pathname.includes('/personas/')
                },
                {
                  icon: 'user-circle',
                  iconPrefix: 'fas',
                  title: 'Profile',
                  href: `/profile`,
                  active: location.pathname.includes('/profile')
                },
              ]}
            />
      }
    </>
    
  )
}
