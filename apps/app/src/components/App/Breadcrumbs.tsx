import React, { memo } from 'react'
import { Box, Button, Dropdown, Spacer, scrollToElementById } from '@avsync.live/formation'
import { useSpaces_activeChannel, useSpaces_activeChannelThreadsInfo, useSpaces_activeGroup, useSpaces_activeGroupChannelsInfo, useSpaces_activeSpace, useSpaces_activeSpaceGroupsInfo, useSpaces_activeThread, useSpaces_setActiveThreadId, useSpaces_spaces } from 'redux-tk/spaces/hooks'
import styled from 'styled-components'
import { Count } from 'components/App/Count'

interface Props {
  anyExpanded?: boolean
  toggleAll?: () => void
}

export const Breadcrumbs = memo(({
  anyExpanded,
  toggleAll,
}: Props) => {
  const spaces = useSpaces_spaces()
  const activeSpace = useSpaces_activeSpace()
  const activeGroup = useSpaces_activeGroup()
  const activeSpaceGroupsInfo = useSpaces_activeSpaceGroupsInfo()
  const activeGroupChannelsInfo = useSpaces_activeGroupChannelsInfo()
  const activeChannelThreadsInfo = useSpaces_activeChannelThreadsInfo()
  const activeThread = useSpaces_activeThread()
  const activeChannel = useSpaces_activeChannel()
  const setActiveThreadId = useSpaces_setActiveThreadId()

  return (
    <S.Breadcrumbs>
      <Button
        compact
        minimal
        icon='diagram-project'
        iconPrefix='fas'
        href={'/'}
      >
      </Button>
      <Dropdown
        text={activeSpace?.name}
        items={spaces?.map(space => ({
          text: space?.name,
          href: `/spaces/${space?.id}`,
        }))}
        maxWidth='14rem'
        minimal
        disablePadding
        compact
      />
      <Count count={spaces?.length} />
      &nbsp;/&nbsp;
      <Dropdown
        text={activeGroup?.name || 'Groups'}
        off={!activeGroup?.name}
        items={activeSpaceGroupsInfo?.map(group => ({
          text: group?.name,
          href: `/spaces/${activeSpace?.id}/groups/${group?.id}`,
        }))}
        maxWidth='14rem'
        minimal
        disablePadding
        compact
      />
      <Count count={activeSpaceGroupsInfo?.length} />

      {
        activeGroup?.name && <>
          &nbsp;/&nbsp;
          <Dropdown
            text={activeChannel?.name || 'Channels'}
            off={!activeChannel?.name}
            items={activeGroupChannelsInfo?.map(channel => ({
              text: channel?.name,
              href: `/spaces/${activeSpace?.id}/groups/${activeGroup.id}/channels/${channel.id}`,
            }))}
            maxWidth='14rem'
            minimal
        disablePadding
        compact
          />
          <Count count={activeGroupChannelsInfo?.length} />

        </>
      }
      
      {
        activeChannel?.name && <>
          &nbsp;/&nbsp;
          <Dropdown
            text={activeThread?.name || 'Threads'}
            off={!activeThread?.name}
            items={activeChannelThreadsInfo?.map(thread => ({
              text: thread?.name,
              onClick: () => setActiveThreadId(thread.id)
            }))}
            maxWidth='18rem'
            minimal
        disablePadding
        compact
          />
          <Count count={activeChannelThreadsInfo?.length} />
        </>
      }
     
      {
        (activeThread?.id && activeChannel?.name) && <Button
          circle
          compact
          minimal
          icon='times'
          iconPrefix='fas'
          onClick={() => setActiveThreadId(null)}
        />
      }

      <Spacer />


      <Box>
        <Button
          icon={'arrow-up'}
          iconPrefix='fas'
          compact
          square
          minimal
          onClick={(e) => {
            e.stopPropagation()
            scrollToElementById('top', { behavior: 'smooth'})
          }}
          title='Scroll to top'
        />
        
        <Button
          icon={'arrow-down'}
          iconPrefix='fas'
          compact
          square
          minimal
          onClick={(e) => {
            e.stopPropagation()
            scrollToElementById('bottom', { behavior: 'smooth', block: 'end'})
          }}
          title='Scroll to bottom'
        />
        {
          toggleAll && <>
           <Button
              icon={anyExpanded ? 'chevron-up' : 'chevron-down'}
              iconPrefix='fas'
              compact
              square
              minimal
              onClick={(e) => {
                e.stopPropagation()
                toggleAll()
              }}
            />
          </>
        }
        </Box>
    </S.Breadcrumbs>
  )
})

const S = {
  Breadcrumbs: styled.div`
    width: calc(100% - 1rem);
    overflow-x: hidden;
    padding: .5rem .5rem;
    display: flex;
    align-items: center;
    color: var(--F_Font_Color_Disabled);
    user-select: none;
  `
}