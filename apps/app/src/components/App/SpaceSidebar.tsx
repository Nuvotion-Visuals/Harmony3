import React from 'react'
import styled from 'styled-components'

import { SpacesSidebar, ItemProps } from '@avsync.live/formation'
import { Groups } from './Groups'
import { SpaceCard } from './SpaceCard'
import { Logo } from './Logo'
import { useHarmony_activeSpace, useHarmony_activeSpaceIndex, useHarmony_setActiveSpaceIndex, useHarmony_spaces } from 'redux-tk/harmony/hooks'
import { Link } from 'components/Util/Link'
import { useLocation } from 'react-router-dom'

const SpacesSidebarComponent = () => {
  const activeSpaceIndex = useHarmony_activeSpaceIndex()
  const setActiveSpaceIndex = useHarmony_setActiveSpaceIndex()

  const spacesInfo = useHarmony_spaces()

  const spaces = [
    ...spacesInfo.map(space => ({
      name: space.name,
      href: `/spaces/${space.id}`,
      src: space.icon ? `http://localhost:8090/api/files/spaces/${space.id}/${space.icon}` : undefined
    })),
    {
      icon: 'plus',
      iconPrefix: 'fas',
      href: '/spaces/create'
    }
  ] as ItemProps[]

  return (
    <SpacesSidebar
      activeSpaceIndex={activeSpaceIndex}
      onClickIndex={(index) => setActiveSpaceIndex(index)}
      spaces={spaces}
    >
      <Link href={'/'}>
        <Logo />
      </Link>
    </SpacesSidebar>
  )
}

interface Props {

}

export const SpaceSidebar = React.memo(({ }: Props) => {
  const activeSpace = useHarmony_activeSpace()
  const location = useLocation() 

  return (<S.GroupsSidebar>
    <SpacesSidebarComponent />
    <S.SidebarContainer>
      {
        (activeSpace?.id && location.pathname !== '/profile') && <SpaceCard
          id={activeSpace.id}
          name={activeSpace?.name}
          previewSrc={activeSpace?.banner ? `http://localhost:8090/api/files/spaces/${activeSpace.id}/${activeSpace.banner}` : undefined}
          groupsCount={5}
          channelsCount={15}
          threadsCount={30}
          messageCount={120}
        />
      }
      {
        !['/spaces/create', '/profile'].includes(location.pathname) &&
          <Groups />
      }
    </S.SidebarContainer>
  </S.GroupsSidebar>)
})

const S = {
  GroupsSidebar: styled.div`
    display: flex;
    height: 100%;
    width: 100%;
    align-items: flex-start;
    border-right: 1px solid var(--F_Surface);
  `,
  SidebarContainer: styled.div`
    height: calc(calc(100vh - calc(1 * var(--F_Header_Height))) - .25rem);
    width: 100%;
    overflow-y: auto;
  `
}