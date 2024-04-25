import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useHarmony_activeChannelThreads, useHarmony_activeThreadId, useHarmony_activeChannel, useHarmony_activeGroup, useHarmony_activeSpace, useHarmony_setActiveThreadId } from 'redux-tk/harmony/hooks'
import { Box, Button, Dropdown, Item, Page, scrollToElementById } from '@avsync.live/formation'
import { TextBox } from './TextBox'
import { Message } from './Message'

export const Channel = () => {
  const activeChannelThreads = useHarmony_activeChannelThreads()
  const activeThreadId = useHarmony_activeThreadId()
  const activeChannel = useHarmony_activeChannel()
  const activeGroup = useHarmony_activeGroup()
  const activeSpace = useHarmony_activeSpace()
  const setActiveThreadId = useHarmony_setActiveThreadId()

  const [textBoxHeight, setTextBoxHeight] = useState(0)
  const textBoxRef = React.createRef<HTMLDivElement>()

  useEffect(() => {
    const updateHeight = () => {
      if (textBoxRef.current) {
        const newHeight = window.innerHeight - textBoxRef.current.clientHeight - 26
        setTextBoxHeight(newHeight)
      }
    }

    const resizeObserver = new ResizeObserver(entries => {
      for (let _ of entries) {
        updateHeight()
      }
    })

    if (textBoxRef.current) {
      resizeObserver.observe(textBoxRef.current)
    }

    updateHeight() // Initial height update

    return () => {
      resizeObserver.disconnect()
    }
  }, [textBoxRef])

  const [expandedStates, setExpandedStates] = useState(new Array(activeChannelThreads.length).fill(false))
  const [anyExpanded, setAnyExpanded] = useState(false)
  const [newThreadId, setNewThreadId] = useState(null)

  useEffect(() => {
    // Map existing states to new threads array
    setExpandedStates(current => {
      const newState = activeChannelThreads.map(thread => {
        const index = current.findIndex((_, i) => activeChannelThreads[i]?.id === thread.id)
        // Preserve existing states where possible
        return index !== -1 ? current[index] : false
      })
      // Automatically expand the new thread if its ID is set
      if (newThreadId) {
        const newIndex = activeChannelThreads.findIndex(thread => thread.id === newThreadId)
        if (newIndex !== -1) {
          newState[newIndex] = true
        }
        setNewThreadId(null)  // Reset newThreadId after handling it
      }
      return newState
    })
  }, [activeChannelThreads])

  const toggleThread = index => {
    setExpandedStates(current => {
      const updatedStates = [...current]
      updatedStates[index] = !updatedStates[index]
      return updatedStates
    })
  }

  const toggleAll = () => {
    setExpandedStates(current => {
      const anyExpanded = current.some(state => state)
      return new Array(activeChannelThreads.length).fill(!anyExpanded)
    })
  }

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

  // Handler for when a new thread ID is passed
  const handleNewThreadId = newThreadId => {
    setNewThreadId(newThreadId)
  }

  return (<>
    <Item
      text={`${activeSpace?.name} > ${activeGroup?.name} > ${activeChannel?.name}`}
      absoluteRightChildren
      onClick={toggleAll}
    >
      <Box>
        <Button
          icon={'arrow-up'}
          iconPrefix='fas'
          compact
          square
          minimal
          onClick={(e) => {
            e.stopPropagation()
            scrollToElementById('top', { behavior: 'smooth' })
          }}
        />
        <Button
          icon={'arrow-down'}
          iconPrefix='fas'
          compact
          square
          minimal
          onClick={(e) => {
            e.stopPropagation()
            scrollToElementById('bottom', { behavior: 'smooth' })}
          }
        />
        <Button
          icon={anyExpanded ? 'chevron-up' : 'chevron-down'}
          iconPrefix='fas'
          compact
          square
          minimal
        />
        <Dropdown
          icon='ellipsis-h'
          iconPrefix='fas'
          compact
          square
          minimal
          items={[
            {
              icon: 'edit',
              iconPrefix: 'fas',
              compact: true,
              text: 'Edit',
              onClick: () => {

              }
            },
            {
              icon: 'trash-alt',
              iconPrefix: 'fas',
              compact: true,
              text: 'Delete',
              onClick: () => {

              }
            }
          ]}
        />
      </Box>
    </Item>
    <S.Content height={textBoxHeight}>
      <div id='top' />
      <Page>
        <Item
          pageTitle={activeChannel?.name}
          absoluteRightChildren
        >
          <Dropdown
            icon='ellipsis-h'
            iconPrefix='fas'
            compact
            square
            minimal
            items={[
              {
                icon: 'edit',
                iconPrefix: 'fas',
                compact: true,
                text: 'Edit',
                onClick: () => {

                }
              },
              {
                icon: 'trash-alt',
                iconPrefix: 'fas',
                compact: true,
                text: 'Delete',
                onClick: () => {

                }
              }
            ]}
          />
        </Item>
        {
          activeChannelThreads.map((thread, index) => (
            <S.Thread key={thread.id} active={thread.id === activeThreadId}>
              <Item
                headingText={thread.name}
                onClick={() => toggleThread(index)}
              >
                {
                  thread.id === activeThreadId
                    ? <Button
                        icon='times'
                        iconPrefix='fas'
                        minimal
                        compact
                        square
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveThreadId(null)
                        }}
                      />
                    : <Button
                        icon='reply'
                        iconPrefix='fas'
                        minimal
                        compact
                        square
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log('hi')
                          setActiveThreadId(thread.id)
                        }}
                      />
                }
                <Dropdown
                  icon='ellipsis-h'
                  iconPrefix='fas'
                  compact
                  minimal
                  square
                  items={[
                    {
                      icon: 'edit',
                      iconPrefix: 'fas',
                      compact: true,
                      text: 'Edit',
                      onClick: (e) => {
                        e.stopPropagation()
                      }
                    },
                    {
                      icon: 'trash-alt',
                      iconPrefix: 'fas',
                      compact: true,
                      text: 'Delete',
                      onClick: (e) => {
                        e.stopPropagation()

                      }
                    }
                  ]}
                />
              </Item>
              <S.Bottom />
              {
                expandedStates[index] && <>
                  {
                    thread.messages.map(message =>
                      <Message
                        message={message}
                        key={message.id}
                      />
                    )
                  }
                  {
                    thread.id !== activeThreadId &&
                      <Box py={.25} px={.5}>
                        <Button
                          expand
                          text='Reply'
                          onClick={() => setActiveThreadId(thread.id)}
                          secondary
                        />
                      </Box>
                  }
                </>
              }
             
              <div id={`thread_${thread.id}`} />
            </S.Thread>
          ))
        }
      </Page>
      <div id='bottom' />
    </S.Content>
    <S.TextBoxContainer ref={textBoxRef}>
      <TextBox 
        onNewThreadId={handleNewThreadId}
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
