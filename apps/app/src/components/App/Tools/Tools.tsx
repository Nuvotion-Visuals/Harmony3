import { useEffect, useState } from 'react'
import { QuickChat } from './QuickChat'
import { NavTabs } from '@avsync.live/formation'
import styled from 'styled-components'
import { CreateImages } from './CreateImages'

export const Tools = () => {
  const [tab, setTab] = useState(() => localStorage.getItem('tab') || 'chat')

  useEffect(() => {
    localStorage.setItem('tab', tab)
  }, [tab])

  const Tool = () => {
    switch(tab) {
      case 'chat':
        return <QuickChat />

      case 'images':
        return <CreateImages />
    }
  }
  return (
    <S.Tools>
      <NavTabs
        navs={[
          {
            title: 'Quick Chat',
            iconPrefix: 'fas',
            active: tab === 'chat',
            onClick: () => setTab('chat')
          },
          {
            title: 'Create Images',
            active: tab === 'images',
            iconPrefix: 'fas',
            onClick: () => setTab('images')
          }
        ]}
        compact
      />
      <Tool />
    </S.Tools>
  )
}

const S = {
  Tools: styled.div`
    width: 100%;
    height: 100vh;
  `,
  
}