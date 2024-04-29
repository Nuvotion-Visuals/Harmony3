import React from 'react'
import styled from 'styled-components'

interface Props {
  groupsCount: number,
  channelsCount: number,
  threadsCount: number,
  messageCount: number
}

export const Counts = React.memo(({ 
  groupsCount,
  channelsCount,
  threadsCount,
  messageCount
}: Props) => 
  <S.Badge title={`${groupsCount} groups · ${channelsCount} channels · ${threadsCount} threads· ${messageCount} messages`}>
    { `${groupsCount}·${channelsCount}·${threadsCount}·${messageCount}` }
  </S.Badge>
)

const S = {
  Badge: styled.div`
    background: black;
    padding: .25rem .5rem;
    border-radius: 1rem;
    font-size: 12px;
    color: var(--F_Font_Color_Disabled);
    display: flex;
    align-items: center;
    height: .75rem;
    line-height: 0;
  `
}