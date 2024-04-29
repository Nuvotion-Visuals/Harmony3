import React from 'react'
import styled from 'styled-components'

interface Props {
  count?: number
}

export const Count = React.memo(({ count }: Props): JSX.Element => 
  <S.Count active={count !== undefined && count > 0}> 
    { count && count > 0 ? count : '·' }
  </S.Count>
)

const S = {
  Count: styled.div<{
    active: boolean
  }>`
    font-size: 12px;
    color: var(--F_Font_Color_Disabled);
    width: 1rem;
    min-width: 1rem;
    height: 1rem;
    border-radius: 100%;
    display: flex;
    justify-content: center;
    font-family: monospace;
    align-items: center;
  `
}