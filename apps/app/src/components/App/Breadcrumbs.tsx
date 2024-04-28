import React, { memo } from 'react'
import { Box, Button, Dropdown, Item, Spacer, scrollToElementById } from '@avsync.live/formation'
import { useHarmony_activeChannel, useHarmony_activeChannelThreadsInfo, useHarmony_activeGroup, useHarmony_activeGroupChannelsInfo, useHarmony_activeSpace, useHarmony_activeSpaceGroupsInfo, useHarmony_activeThread, useHarmony_setActiveThreadId, useHarmony_spaces } from 'redux-tk/harmony/hooks'
import styled from 'styled-components';

interface Props {
  anyExpanded?: boolean;
  toggleAll?: () => void;
}

export const Breadcrumbs = memo(({
  anyExpanded,
  toggleAll,
}: Props) => {
  const spaces = useHarmony_spaces()
  const activeSpace = useHarmony_activeSpace()
  const activeGroup = useHarmony_activeGroup()
  const activeSpaceGroupsInfo = useHarmony_activeSpaceGroupsInfo()
  const activeGroupChannelsInfo = useHarmony_activeGroupChannelsInfo()
  const activeChannelThreadsInfo = useHarmony_activeChannelThreadsInfo()
  const activeThread = useHarmony_activeThread()
  const activeChannel = useHarmony_activeChannel()
  const setActiveThreadId = useHarmony_setActiveThreadId()

  return (
    <S.Breadcrumbs>
      <Button
        compact
        minimal
        icon='diagram-project'
        iconPrefix='fas'
        href={'/'}
      />
      <Dropdown
        text={activeSpace?.name}
        items={spaces?.map(space => ({
          text: space?.name,
          href: `/spaces/${space?.id}`,
        }))}
        maxWidth='14rem'
        minimal
        compact
      />
      /
      <Dropdown
        text={activeGroup?.name || 'Groups'}
        off={!activeGroup?.name}
        items={activeSpaceGroupsInfo?.map(group => ({
          text: group?.name,
          href: `/spaces/${activeSpace?.id}/groups/${group?.id}`,
        }))}
        maxWidth='14rem'
        minimal
        compact
      />
      {
        activeGroup?.name && <>
          /
          <Dropdown
            text={activeChannel?.name || 'Channels'}
            off={!activeChannel?.name}
            items={activeGroupChannelsInfo?.map(channel => ({
              text: channel?.name,
              href: `/spaces/${activeSpace?.id}/groups/${activeGroup.id}/channels/${channel.id}`,
            }))}
            maxWidth='14rem'
            minimal
            compact
          />
        </>
      }
      
      {
        activeChannel?.name && <>
          /
          <Dropdown
            text={activeThread?.name || 'Threads'}
            off={!activeThread?.name}
            items={activeChannelThreadsInfo?.map(thread => ({
              text: thread?.name,
              onClick: () => setActiveThreadId(thread.id)
            }))}
            maxWidth='18rem'
            minimal
            compact
          />
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
       
        <Dropdown
          icon='ellipsis-h'
          iconPrefix='fas'
          compact
          square
          minimal
          items={[
            {
              icon: 'edit',
              iconPrefix: 'fas',
              compact: true,
              text: 'Edit',
              onClick: () => {},
            },
            {
              icon: 'trash-alt',
              iconPrefix: 'fas',
              compact: true,
              text: 'Delete',
              onClick: () => {},
            },
          ]}
        />
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
  `
}