import { NavSpaces } from '@avsync.live/formation'
import { Realtime } from './components/Realtime'
import { SpaceSidebar } from './components/App/SpaceSidebar'

interface Props {
  children: React.ReactNode
}

export const App = ({ children }: Props) => {

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
        secondPage={<><Realtime /></>}
        thirdPage={<>{children}</>}
        navsPrimary={[
       
        ]}
      />
     
      {/* <Realtime /> */}
    </>
  )
}
