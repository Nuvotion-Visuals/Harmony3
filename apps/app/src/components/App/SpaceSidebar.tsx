import React from 'react'
import styled from 'styled-components'

import { SpacesSidebar, ItemProps, Gap } from '@avsync.live/formation'
import { Groups } from './Groups'
import { SpaceCard } from './SpaceCard'
import { Logo } from './Logo'
import { useSpaces_activeSpace, useSpaces_activeSpaceIndex, useSpaces_setActiveSpaceIndex, useSpaces_spaces } from 'redux-tk/spaces/hooks'
import { Link } from 'components/Util/Link'
import { useLocation } from 'react-router-dom'

const SpacesSidebarComponent = () => {
  const activeSpaceIndex = useSpaces_activeSpaceIndex()
  const setActiveSpaceIndex = useSpaces_setActiveSpaceIndex()

  const spacesInfo = useSpaces_spaces()

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
  const activeSpace = useSpaces_activeSpace()
  const location = useLocation() 

  return (<S.GroupsSidebar>
    <SpacesSidebarComponent />
    <S.SidebarContainer>
      <Gap>
        {
          (activeSpace?.id && location.pathname !== '/profile') && <SpaceCard
            id={activeSpace.id}
            name={activeSpace?.name}
            previewSrc={activeSpace?.banner ? `http://localhost:8090/api/files/spaces/${activeSpace.id}/${activeSpace.banner}` : undefined}
          />
        }
        {
          !['/spaces/create', '/profile'].includes(location.pathname) &&
            <Groups />
        }
      </Gap>
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
    * {
      user-select: none;
    }
  `,
  SidebarContainer: styled.div`
    height: calc(calc(100vh - calc(1 * var(--F_Header_Height))) - 6px);
    width: 100%;
    overflow-y: auto;
  `
}