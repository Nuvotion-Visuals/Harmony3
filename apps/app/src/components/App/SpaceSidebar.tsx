import React, { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'

import { AspectRatio, Box, SpacesSidebar, Item, Dropdown, Gap, Button, LineBreak, Label, Spacer, ItemProps } from '@avsync.live/formation'
import { Groups } from './Groups'
import { SpaceCard } from './SpaceCard'
import { Logo } from './Logo'

const SpacesSidebarComponent = () => {

  const spacesInfo = [
    {
      name: 'Space One',
      guid: 'space-one',
      previewSrc: 'https://api.avsync.live/uploads/medium_Hero_ab87aace42.jpg'
    },
    {
      name: 'Space Two',
      guid: 'space-two',
      previewSrc: 'https://api.avsync.live/uploads/medium_scenes_12e25f0362.png'
    },
    {
      name: 'Space Three',
      guid: 'space-three',
      previewSrc: 'https://api.avsync.live/uploads/medium_Hero_ab87aace42.jpg'
    }
  ];

  const spaces = [
    ...spacesInfo.map(space => ({
      name: space.name,
      href: `/spaces/${space.guid}`,
      src: space.previewSrc
    })),
    {
      icon: 'plus',
      iconPrefix: 'fas',
      href: '/spaces/add'
    }
  ] as ItemProps[]

  return (
    <SpacesSidebar
      activeSpaceIndex={0}
      onClickIndex={() => {}}
      spaces={spaces}
    >
      <Logo />
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
        previewSrc="https://api.avsync.live/uploads/medium_jive_djs_d7e9e4490a.jpg"
        name="Jive DJs"
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
    align-items: flex-start;
  `,
  SidebarContainer: styled.div`
    height: calc(calc(100vh - calc(1 * var(--F_Header_Height))) - .25rem);
    width: 100%;
    overflow-y: auto;
  `
}