import { AspectRatio, Button, Gap, Grid, Icon, Page, useBreakpoint } from '@avsync.live/formation'
import React, { useState } from 'react'
import styled from 'styled-components'
import { Link } from 'components/Util/Link'
import { SpaceCard } from './SpaceCard'
import { useSpaces_spaces } from 'redux-tk/spaces/hooks'

const SpacesDashboard = () => {
  const spaces = useSpaces_spaces()

  const { isMobile, isDesktop } = useBreakpoint()
  const [searchQuery, _] = useState('')

  return (<S.SpacesDashboard>
    <S.Inner isDesktop={isDesktop}>
      <Gap gap={isMobile ? 1 : 1.5}>
        <Page noPadding>
          <S.SearchContainer>
          </S.SearchContainer>
        </Page>
        <Grid maxWidth={isMobile ? 12 : 18} gap={isMobile ? .75 : 1.5} >
          {
            spaces.filter(space => space.name.toLowerCase().includes(searchQuery.toLowerCase())).map(space =>
              <Link href={`/spaces/${space.id}`}>
                <S.CardContainer>
                  <SpaceCard
                    {...space}
                    previewSrc={space?.banner ? `http://localhost:8090/api/files/spaces/${space.id}/${space.banner}` : undefined}
                    expandVertical
                  />
                </S.CardContainer>
              </Link>
            )
          }

          <Link href='/spaces/create'>
            <S.AddContainer>
              <AspectRatio ratio={3/1}>
                <Icon icon='plus' iconPrefix='fas' size='xl' />
              </AspectRatio>
            </S.AddContainer>
          </Link>
      </Grid>
      </Gap>
    </S.Inner>
    <S.Absolute>
      <Button
        icon='users'
        iconPrefix='fas'
        text='Personas'
        href='/personas'
        minimal
        compact
      />
      <Button
        icon='user-circle'
        iconPrefix='fas'
        text='Profile'
        href='/profile'
        minimal
        compact
      />
    </S.Absolute>
  </S.SpacesDashboard>)
}

export default SpacesDashboard

const S = {
  SpacesDashboard: styled.div`
    height: 100vh;;
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: black;
    position: relative;
  `,
  Inner: styled.div<{
    isDesktop: boolean
  }>`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    max-width: ${props => props.isDesktop ? '90vw' : 'none'};
  `,
  CardContainer: styled.div`
    border-radius: 1rem;
    overflow: hidden;
    height: 100%;
    background: var(--F_Surface_0);
    * {
      cursor: pointer;
    }
  `,
  AddContainer: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    border-radius: 1rem;
    box-shadow: var(--F_Outline);
    &:hover {
    box-shadow: var(--F_Outline_Hover);

    }
  `,
  SearchContainer: styled.div`
    width: 100%;
    height: 100%;
    overflow-y: visible;
  `,

  Absolute: styled.div`
    width: 100%;
    height: var(--F_Input_Height_Compact);
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
  `
}