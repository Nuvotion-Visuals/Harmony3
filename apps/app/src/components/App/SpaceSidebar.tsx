import React from 'react'
import styled from 'styled-components'

import { SpacesSidebar, ItemProps, Gap, Box } from '@avsync.live/formation'
import { Groups } from './Groups'
import { SpaceCard } from './SpaceCard'
import { Logo } from './Logo'
import { useSpaces_activeSpace, useSpaces_activeSpaceIndex, useSpaces_setActiveSpaceIndex, useSpaces_spaces } from 'redux-tk/spaces/hooks'
import { Link } from 'components/Util/Link'
import { useLocation } from 'react-router-dom'
import { Voice } from 'components/App/Voice'

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
    <Box height='calc(100% - var(--F_Input_Height))'>
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
    </Box>
    <S.VoiceContainer>
      <Voice />
    </S.VoiceContainer>
  </S.GroupsSidebar>)
})

const S = {
  GroupsSidebar: styled.div`
    display: flex;
    height: 100%;
    width: 100%;
    align-items: flex-start;
    flex-wrap: wrap;
    border-right: 1px solid var(--F_Surface);
    * {
      user-select: none;
    }
  `,
  SidebarContainer: styled.div`
    height: calc(100vh - var(--F_Header_Height) - 6px - var(--F_Input_Height));
    width: 100%;
    overflow-y: auto;
  `,
  VoiceContainer: styled.div`
    height: calc(var(--F_Input_Height) - 1px);
    width: 100%;
    border-top: 1px solid var(--F_Surface);
  `
}