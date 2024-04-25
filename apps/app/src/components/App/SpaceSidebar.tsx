import React from 'react'
import styled from 'styled-components'

import { SpacesSidebar, ItemProps } from '@avsync.live/formation'
import { Groups } from './Groups'
import { SpaceCard } from './SpaceCard'
import { Logo } from './Logo'
import { useHarmony_activeSpaceIndex, useHarmony_setActiveSpaceIndex, useHarmony_spaces } from 'redux-tk/harmony/hooks'
import { Link } from 'components/Util/Link'

const SpacesSidebarComponent = () => {
  const activeSpaceIndex = useHarmony_activeSpaceIndex()
  const setActiveSpaceIndex = useHarmony_setActiveSpaceIndex()

  const spacesInfo = useHarmony_spaces()

  const spaces = [
    ...spacesInfo.map(space => ({
      name: space.name,
      href: `/spaces/${space.id}`,
      // src: ''
    })),
    {
      icon: 'plus',
      iconPrefix: 'fas',
      href: '/spaces/add'
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
  return (<S.GroupsSidebar>
    <SpacesSidebarComponent />
    <S.SidebarContainer>
      <SpaceCard
        previewSrc='https://api.avsync.live/uploads/medium_jive_djs_d7e9e4490a.jpg'
        name='Jive DJs'
        groupsCount={5}
        channelsCount={15}
        threadsCount={30}
        messageCount={120}
      />
      <Groups />
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