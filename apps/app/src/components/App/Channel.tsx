import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useSpaces_activeChannelThreads, useSpaces_activeThreadId, useSpaces_activeChannel, useSpaces_setActiveThreadId } from 'redux-tk/spaces/hooks'
import { Page, scrollToElementById } from '@avsync.live/formation'
import { TextBox } from './TextBox'
import { Thread } from './Thread'
import { ChannelHeader } from './ChannelHeader'
import { Breadcrumbs } from './Breadcrumbs'
import useDynamicHeight from 'components/Hooks/useDynamicHeight'

export const Channel = () => {
  const activeChannelThreads = useSpaces_activeChannelThreads()
  const activeThreadId = useSpaces_activeThreadId()
  const activeChannel = useSpaces_activeChannel()
  const setActiveThreadId = useSpaces_setActiveThreadId()

  const { ref, height } = useDynamicHeight('channel_height', 41)

  const [expandedStates, setExpandedStates] = useState(new Array(activeChannelThreads.length).fill(false))
  const [anyExpanded, setAnyExpanded] = useState(false)
  const [newThreadId, setNewThreadId] = useState(null)

  useEffect(() => {
    setExpandedStates(current => {
      const newState = activeChannelThreads.map(thread => {
        const index = current.findIndex((_, i) => activeChannelThreads[i]?.id === thread.id)
        return index !== -1 ? current[index] : false
      })
      if (newThreadId) {
        const newIndex = activeChannelThreads.findIndex(thread => thread.id === newThreadId)
        if (newIndex !== -1) {
          newState[newIndex] = true
        }
        setNewThreadId(null)
      }
      return newState
    })
  }, [activeChannelThreads])

  const toggleThread = useCallback((index) => {
    setExpandedStates(current => {
      const updatedStates = [...current]
      updatedStates[index] = !updatedStates[index]
      return updatedStates
    })
  }, [])

  const toggleAll = useCallback(() => {
    setExpandedStates(current => {
      const anyExpanded = current.some(state => state)
      return new Array(activeChannelThreads.length).fill(!anyExpanded)
    })
  }, [activeChannelThreads.length])

  useEffect(() => {
    setAnyExpanded(expandedStates.some(state => state))
  }, [expandedStates])

  useEffect(() => {
    if (activeThreadId) {
      const threadIndex = activeChannelThreads.findIndex(thread => thread.id === activeThreadId)
      if (threadIndex !== -1) {
        setExpandedStates(current => {
          const newStates = [...current]
          newStates[threadIndex] = true
          return newStates
        })
      }
      scrollToElementById(`thread_${activeThreadId}`, { behavior: 'smooth' })
    }
  }, [activeThreadId, activeChannelThreads])

  const handleNewThreadId = useCallback((newThreadId) => {
    setNewThreadId(newThreadId)
  }, [])

  return (<>
    <Breadcrumbs
      anyExpanded={anyExpanded}
      toggleAll={toggleAll}
    />
    <S.Content height={height}>
      <div id='top' />
      <ChannelHeader
        channel={activeChannel}
      />
      <Page>
        {
          activeChannelThreads.map((thread, index) => (
            <Thread
              key={thread.id}
              index={index}
              thread={thread}
              active={thread.id === activeThreadId}
              onToggle={toggleThread}
              onReply={setActiveThreadId}
              expanded={expandedStates[index]}
            />
          ))
        }
      </Page>
      <div id='bottom' />
    </S.Content>
    <S.TextBoxContainer ref={ref}>
      <TextBox 
        onNewThreadId={handleNewThreadId}
        activeThreadId={activeThreadId}
      />
    </S.TextBoxContainer>
  </>)
}

const S = {
  Thread: styled.div<{ active: boolean }>`
    width: calc(100% - 4px);
    display: flex;
    flex-direction: column;
    border-left: ${props => props.active ? '4px solid var(--F_Primary)' : '4px solid var(--F_Surface_0)'};
    border-radius: .125rem 0 0 .125rem;
    margin: .25rem 0;
    padding: .25rem 0;
    border-bottom: 1px solid var(--F_Surface_0);
  `,
  Bottom: styled.div`
    width: 100%;
    height: .25rem;
  `,
  Content: styled.div<{ height: number }>`
    width: 100%;
    height: ${props => `calc(${props.height}px - 2rem)`};
    padding-bottom: 2rem;
    overflow-y: auto;
    overflow-x: hidden;
  `,
  TextBoxContainer: styled.div`
    max-height: 50vh;
    width: 100%;
    position: relative;
    overflow: auto;
    display: flex;
    justify-content: center;
    padding: .25rem 0;
  `
}
