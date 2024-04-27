import { AspectRatio, Box, Button, Gap, Grid, Page, TextInput, useBreakpoint } from '@avsync.live/formation'
import React, { useState } from 'react'
import styled from 'styled-components'
import { Link } from 'components/Util/Link'
import { SpaceCard } from './SpaceCard'
import { useHarmony_spaces } from 'redux-tk/harmony/hooks'

interface Props {
  
}

const SpacesDashboard = ({ }: Props) => {
  const spaces = useHarmony_spaces()

  const { isMobile, isDesktop } = useBreakpoint()
  const [searchQuery, set_searchQuery] = useState('')

  return (<S.SpacesDashboard>
    <S.Inner isDesktop={isDesktop}>
      <Gap gap={isMobile ? 1 : 1.5}>
      <Page noPadding>
        <S.SearchContainer>
        </S.SearchContainer>
      </Page>
      <Grid maxWidth={isMobile ? 10 : 14} gap={isMobile ? .75 : 1.5} >
      {
        spaces.filter(space => space.name.toLowerCase().includes(searchQuery.toLowerCase())).map(space =>

          <Link href={`/spaces/${space.id}`}>
            <S.CardContainer>

              <SpaceCard
                {...space}
                previewSrc='https://api.avsync.live/uploads/medium_jive_djs_d7e9e4490a.jpg'
              />
            </S.CardContainer>

          </Link>

        )
      }
      <Link href='/spaces/create'>
      <S.AddContainer>
        <AspectRatio ratio={16/9}>
          <Button icon='plus' iconPrefix='fas' hero minimal />
        </AspectRatio>
      </S.AddContainer>

      </Link>
     
    </Grid>
      {/* <Page noPadding>
        <ZoomableHierarchyNavigator
          flareData={{
            name: 'Spaces',
            children: spaceGuids.map(spaceGuid => ({
              name: spacesByGuid[spaceGuid]?.name || '',
              children: spacesByGuid[spaceGuid]?.groupGuids?.map(groupGuid => ({
                name: groupsByGuid[groupGuid].name,
                size: groupsByGuid[groupGuid].channelGuids.length || 1,
                children: 
                  groupsByGuid[groupGuid].channelGuids.length
                    ? groupsByGuid[groupGuid].channelGuids.map(channelGuid => ({
                        name: channelsByGuid[channelGuid].name,
                        size: channelsByGuid[channelGuid].threadGuids.length || 1,
                        onClick: () => router.push(`/spaces/${spaceGuid}/groups/${groupGuid}/channels/${channelGuid}`),
                        children: 
                          channelsByGuid[channelGuid].threadGuids.length
                            ? channelsByGuid[channelGuid].threadGuids.map(threadGuid => ({
                                name: threadsByGuid[threadGuid].name,
                                size: threadsByGuid[threadGuid].messageGuids.length || 1,
                              }))
                            : [{ name: 'ADD ', size: 2}]
                      })) 
                    : [{ name: 'ADD ', size: 2}]
              }))
            }))
          }}
        />
    </Page> */}
    
  
    </Gap>
    </S.Inner>
   
  </S.SpacesDashboard>)
}

export default SpacesDashboard

const S = {
  SpacesDashboard: styled.div`
    min-height: calc(100vh - 1.5rem);
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: black;
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
  `
}