import { Box, Spacer, AspectRatio, Gap, Item } from '@avsync.live/formation'
import React from 'react'
import styled from 'styled-components'
import { Badge } from './Badge'

interface Props {
  previewSrc?: string
  name?: string
  groupsCount?: number
  channelsCount?: number
  threadsCount?: number
  messageCount?: number
  children?: React.ReactNode
  expandVertical?: boolean
}

export const SpaceCard = React.memo(({ 
  previewSrc,
  name, 
  groupsCount, 
  channelsCount, 
  threadsCount, 
  messageCount, 
  children,
  expandVertical
}: Props) => {
  const SpaceName = React.memo(() => (<S.SpaceName>
    <Box>
      <Item pageTitle={name}>
        { children }
      </Item>
    </Box>
  </S.SpaceName>))

  return (<S.SpaceCard expandVertical={expandVertical}>
    <S.OverlayContainer>
        <S.Overlay>
          <SpaceName />
        </S.Overlay>
        <S.OverlayBottom>
        <S.SpaceStats>
          <Spacer />
          <Badge 
            groupsCount={groupsCount || 0}
            channelsCount={channelsCount || 0}
            threadsCount={threadsCount || 0}
            messageCount={messageCount || 0}
          />
        </S.SpaceStats>
        
        </S.OverlayBottom>
        <AspectRatio
          ratio={previewSrc ? 16/9 : 4/1}
          coverBackground
        />
    </S.OverlayContainer>
  </S.SpaceCard>)
})

const S = {
  SpaceCard: styled.div<{
    expandVertical?: boolean
  }>`
    width: 100%;
    height: ${props => props.expandVertical ? '100%' : 'auto'};
    background: var(--F_Surface_1);
  `,
  OverlayContainer: styled.div`
    height: 100%;
    width: 100%;
    position: relative;
    top: 0;
    z-index: 2;
  `,
  Overlay: styled.div`
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 3;
    background: linear-gradient(to top, hsla(0, 0%, 7%, 0) 0%, hsla(0, 0%, 7%,.4) 40%, hsla(0, 0%, 7%,.5) 100%);
  `,
  OverlayBottom: styled.div`
    position: absolute;
    bottom: 0;
    z-index: 1;
    width: 100%;
    background: linear-gradient(to bottom, hsla(0, 0%, 7%, 0) 0%, hsla(0, 0%, 7%,.4) 40%, hsla(0, 0%, 7%,.5) 100%);
  `,
  SpaceName: styled.div`
    width: 100%;
  `,
  SpaceStats: styled.div`
    width: calc(100% - .75rem);
    height: 2rem;
    padding: .25rem;
    display: flex;
  `,
  PosterContainer: styled.div`
    border-radius: .75rem;
    overflow: hidden;
    width: 100%;
  `
}