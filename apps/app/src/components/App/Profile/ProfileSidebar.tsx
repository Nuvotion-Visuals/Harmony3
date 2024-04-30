import { Item } from '@avsync.live/formation'
import styled from 'styled-components'

export const ProfileSidebar = () => {
  return <S.ProfileSidebar>
    <Item
      pageTitle='Profile'
    >
    </Item>
  </S.ProfileSidebar>
}

const S = {
  ProfileSidebar: styled.div`
    width: 100%;
    height: 100%;
    border-right: 1px solid var(--F_Surface);
  `
}