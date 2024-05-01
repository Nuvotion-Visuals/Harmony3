import { Box, Gap, Item } from '@avsync.live/formation'
import styled from 'styled-components'
import { Keys } from './Keys'
import { Export } from './Export'

export const ProfileSidebar = () => {
  return <S.ProfileSidebar>
    <Item
      pageTitle='Profile'
    >
    </Item>
    <Item
      subtitle='API Keys'
    />
    <Gap gap={1}>
      <Box px={.5} width={'calc(100% - 1rem)'}>
        <Keys />
      </Box>
      <Box px={.5}>
        <Export />
      </Box>
    </Gap>
  </S.ProfileSidebar>
}

const S = {
  ProfileSidebar: styled.div`
    width: 100%;
    height: 100%;
    border-right: 1px solid var(--F_Surface);
  `
}