import { Box, Item } from '@avsync.live/formation'
import styled from 'styled-components'
import { Keys } from './Keys'

export const ProfileSidebar = () => {
  return <S.ProfileSidebar>
    <Item
      pageTitle='Profile'
    >
    </Item>
    <Box px={.5} width={'calc(100% - 1rem)'}>
      <Keys />
    </Box>
  </S.ProfileSidebar>
}

const S = {
  ProfileSidebar: styled.div`
    width: 100%;
    height: 100%;
    border-right: 1px solid var(--F_Surface);
  `
}