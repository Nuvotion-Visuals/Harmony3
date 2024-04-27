import React, { useState, useEffect, memo, useCallback, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { useHarmony_setActiveThreadId } from 'redux-tk/harmony/hooks'
import { Box, Button, ContextMenu, Dropdown, Gap, Item, ItemProps, TextInput, onScrollWheelClick } from '@avsync.live/formation'
import { Message } from 'components/App/Message'
import { pb } from 'redux-tk/pocketbase'
import { generate_threadNameAndDescription } from 'language/generate/threadNameAndDescription'
import * as selectors from 'redux-tk/harmony/selectors'
import { store } from 'redux-tk/store'
import { JsonValidator } from 'utils/JSONValidator'
import { MessageSuggestions } from 'components/App/Suggestions/MessageSuggestions'

interface Props {
  thread: any
  active: boolean
  index: number
  onToggle: (index: number) => void
  onReply: (id: string) => void
}

export const Thread = memo(({ 
  thread, 
  active, 
  index,
  onToggle,
  onReply
}: Props) => {
  const setActiveThreadId = useHarmony_setActiveThreadId()
  const [expanded, setExpanded] = useState(active)

  const [name, setName] = useState(thread?.name === 'New thread' ? '' : thread?.name)
  const [description, setDescription] = useState(thread?.description)
  const [edit, setEdit] = useState(false)

  useEffect(() => {
    setName(thread?.name)
  }, [thread?.name])
  
  useEffect(() => {
    setDescription(thread?.description)
  }, [thread?.description])

  const jsonValidatorRef = useRef(new JsonValidator())

  const handleCancelEdit = useCallback(() => {
    setName(thread.name)
    setDescription(thread.description)
    setEdit(false)
  }, [thread.name, thread.description])

  const handleDelete = useCallback(async () => {
    try {
      await pb.collection('threads').delete(thread.id)
      setActiveThreadId(null)
    } 
    catch (error) {
      console.error('Failed to delete message:', error)
      alert('Failed to delete message')
    }
  }, [thread.id, setActiveThreadId])
  
  const handleUpdate = useCallback(async () => {
    try {
      await pb.collection('threads').update(thread.id, {
        name,
        description
      })
      setEdit(false)
    } 
    catch (error) {
      console.error('Failed to update thread:', error)
      alert('Failed to update thread')
    }
  }, [thread.id, name, description])

  useEffect(() => {
    setExpanded(active)
  }, [active])

  const toggleExpanded = useCallback(() => {
    setExpanded(prevExpanded => !prevExpanded)
    onToggle(index)
  }, [index])

  const handleReply = useCallback(() => {
    setActiveThreadId(thread.id)
    onReply(thread.id)
  }, [thread.id])

  const dropdownItems = useMemo(() => [
    {
      icon: 'reply',
      iconPrefix: 'fas',
      compact: true,
      text: 'Reply',
      onClick: (e) => {
        e.stopPropagation()
        handleReply()
      },
    },
    {
      icon: 'bolt-lightning',
      iconPrefix: 'fas',
      compact: true,
      text: 'Suggest',
      onClick: (e) => {
        e.stopPropagation()
        const threadMessagesWithRole = selectors.selectThreadMessagesWithRole(thread.id)(store.getState())
        generate_threadNameAndDescription({
          prompt: JSON.stringify(threadMessagesWithRole),
          enableEmoji: true,
          onComplete: async (text) => {
            const newName = JSON.parse(text).name
            const newDescription = JSON.parse(text).description
            try {
              await pb.collection('threads').update(thread.id, {
                name: newName,
                description: newDescription
              })
              setEdit(false)
            } 
            catch (error) {
              console.error('Failed to update thread:', error)
              alert('Failed to update thread')
            }
          },
          onPartial: text => {
            setName(jsonValidatorRef.current.parseJsonProperty(text, 'name'))
            setDescription(jsonValidatorRef.current.parseJsonProperty(text, 'description'))
          }
        })
      }
    },
    {
      icon: 'edit',
      iconPrefix: 'fas',
      compact: true,
      text: 'Edit',
      onClick: (e) => {
        e.stopPropagation()
        setEdit(true)
      },
    },
    {
      icon: 'trash-alt',
      iconPrefix: 'fas',
      compact: true,
      text: 'Delete',
      onClick: (e) => {
        e.stopPropagation()
        handleDelete()
      },
    },
  ], []) as ItemProps[]

  return (
    <S.Container active={active}>
      {
        edit
          ? <Box ml={.5}>
              <Gap disableWrap>
                <Gap >
                  <TextInput
                    value={name}
                    onChange={val => setName(val)}
                    autoFocus
                    placeholder='Name'
                    onEnter={handleUpdate}
                    compact
                  />
                  <TextInput
                    value={description}
                    onChange={val => setDescription(val)}
                    placeholder='Description'
                    onEnter={handleUpdate}
                    compact
                  />
                </Gap>
                <Box width='var(--F_Input_Height)' wrap>
                  <Gap>
                    <Button
                      icon='save'
                      iconPrefix='fas'
                      square
                      onClick={handleUpdate}
                      compact
                    />
                    <Button
                      icon='times'
                      iconPrefix='fas'
                      square
                      minimal
                      onClick={handleCancelEdit}
                      compact
                    />
                  </Gap>
                </Box>
              </Gap>
            </Box>
          : <ContextMenu
              dropdownProps={{
                items: dropdownItems
              }}
            >
              <Item
                headingText={name}
                subtitle={description}
                onClick={toggleExpanded}
                onMouseDown={onScrollWheelClick(() => handleDelete())}
              >
                {
                  active 
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
                          handleReply()
                        }}
                      />
                }
                <Dropdown
                  icon='ellipsis-h'
                  iconPrefix='fas'
                  compact
                  minimal
                  square
                  items={dropdownItems}
                />
              </Item>
            </ContextMenu>
          }
      <S.Bottom />
      {
        expanded && 
          <>
            {
              thread.messageIds.map(id => (
                <Message id={id} key={id} />
              ))
            }
            {
              active
                ? <MessageSuggestions />
                : <Box py={0.25} px={0.5}>
                    <Button expand text='Reply' onClick={handleReply} secondary />
                  </Box>
            }
          </>
      }
      <div id={`thread_${thread.id}`} />
    </S.Container>
  )
})

const S = {
  Container: styled.div<{
    active: boolean
  }>`
    width: calc(100% - 4px);
    display: flex;
    flex-direction: column;
    border-left: ${(props) =>
      props.active
        ? '4px solid var(--F_Primary)'
        : '4px solid var(--F_Surface_0)'};
    border-radius: 0.125rem 0 0 0.125rem;
    margin: 0.25rem 0;
    padding: 0.25rem 0;
    border-bottom: 1px solid var(--F_Surface_0);
  `,
  Bottom: styled.div`
    width: 100%;
    height: 0.25rem;
  `,
}
