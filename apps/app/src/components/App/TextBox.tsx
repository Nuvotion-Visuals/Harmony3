import { memo, useEffect, useState } from 'react'
import { Button, Dropdown, Item, RichTextEditor, scrollToElementById } from '@avsync.live/formation'
import { useSpaces_activeChannelId, useSpaces_activeThread, useSpaces_currentUserId, useSpaces_setActiveThreadId } from 'redux-tk/spaces/hooks'
import styled from 'styled-components'
import { pb } from 'redux-tk/pocketbase'
import { usePersonas_activePersona, usePersonas_personas, usePersonas_setActivePersonaId } from 'redux-tk/personas/hooks'
import { useNavigate } from 'react-router-dom'

interface Props {
  onNewThreadId?: (threadId: string) => void
  activeThreadId?: string
  onSend?: (message: string) => void
}

export const TextBox = memo(({
  onNewThreadId,
  activeThreadId,
  onSend,
}: Props) => {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const setActiveThreadId = useSpaces_setActiveThreadId()
  const activeChannelId = useSpaces_activeChannelId()
  const activeThread = useSpaces_activeThread()
  const userId = useSpaces_currentUserId()
  const personas = usePersonas_personas()
  const activePersona = usePersonas_activePersona()
  const setActivePersonaId = usePersonas_setActivePersonaId()

  const sendMessage = async (text) => {
    if (onSend) {
      onSend(text)
      setText('')
      return
    }
    if (!text.trim()) return

    let threadId = activeThreadId

    if (!threadId && activeChannelId && userId) {
      // Create a new thread since there's no active thread
      const threadData = {
        name: 'New thread',
        userid: userId,
        channelid: activeChannelId
      }
      try {
        const response = await pb.collection('threads').create(threadData)
        threadId = response.id
        setActiveThreadId(threadId)
        onNewThreadId(threadId)
      } 
      catch (error) {
        console.error('Failed to create thread:', error)
        alert('Error creating thread. Check console for details.')
        return
      }
    }

    if (threadId) {
      // Send the message to the thread
      try {
        await pb.collection('messages').create({
          text,
          userid: userId,
          threadid: threadId,
          personaid: activePersona?.id
        })
        setText('')
      } 
      catch (error) {
        console.error('Failed to send message:', error)
        alert('Error sending message. Check console for details.')
      }
    }
  }

  const [autoFocus, setAutoFocus] = useState(false)

  useEffect(() => {
    if (activeThreadId) {
      const id = `thread_${activeThreadId}`
      if (document.getElementById(id))
      scrollToElementById(id, { behavior: 'smooth', block: 'end' })
    }
    setAutoFocus(!!activeThreadId)
    setTimeout(() => {
      setAutoFocus(false)
    }, 10)
  }, [activeThreadId])


  return (
    <S.Wrapper>
      <Item
        src={activePersona?.avatar ? `http://localhost:8090/api/files/personas/${activePersona?.id}/${activePersona?.avatar}` : null}
        subtitle={activePersona?.name}
        absoluteRightChildren
        compact
      >
        <Dropdown
          icon='ellipsis-h'
          iconPrefix='fas'
          maxWidth='12rem'
          compact
          minimal
          items={[
            ...personas.map(persona => ({
              src: persona?.avatar ? `http://localhost:8090/api/files/personas/${persona?.id}/${persona?.avatar}` : undefined,
              text: persona?.name,
              subtitle: `${persona?.description} · ${persona?.provider} · ${persona?.model}`,
              onClick: () => setActivePersonaId(persona?.id),
              absoluteRightChildren: true,
              children: <Button
                icon='gear'
                iconPrefix='fas'
                compact
                square
                minimal
                onClick={() => navigate(`/personas/${persona?.id}`)}
              />
            })),
            {
              text: 'Default Assistant',
              icon: 'user',
              iconPrefix: 'fas',
              compact: true,
              onClick: () => setActivePersonaId(null),
            },
            {
              text: 'Create',
              icon: 'user-plus',
              iconPrefix: 'fas',
              href: '/personas/create',
              compact: true,
            }
        ]}
        />
      </Item>

      {
        activeThreadId &&
          <Item
            icon='reply'
            text={`Replying to ${activeThread?.name}`}
            absoluteRightChildren
            onClick={() => scrollToElementById(`thread_${activeThreadId}`, { behavior: 'smooth' })}
            compact
          >
            <Button
              icon='times'
              iconPrefix='fas'
              onClick={(e) => {
                e.stopPropagation()
                setActiveThreadId(null)
              }}
              compact
              minimal
            />
          </Item>
      }

      <S.TextBox onClick={() => {
         setAutoFocus(true)
         setTimeout(() => {
           setAutoFocus(false)
         }, 10)
      }}>
        <RichTextEditor
          value={text}
          onChange={val => setText(val)}
          outline
          px={1}
          minimal={true}
          autoFocus={autoFocus}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              console.log(text)
              sendMessage(text.substring(0, text.length - 11))
            }
          }}
          placeholder='Send a message'
        />
        <S.Absolute>
          <Button
            icon='arrow-up'
            iconPrefix='fas'
            onClick={() => sendMessage(text)}
            circle
            minimal
          />
        </S.Absolute>
       
       
      </S.TextBox>
    </S.Wrapper>
  )
})

const S = {
  Wrapper: styled.div`
    max-width: calc(100% - 1.5rem);
    width: var(--F_Page_Width);
    background: black;
  `,
  TextBox: styled.div`
    width: 100%;
    max-height: 100%;
    position: relative;
    display: flex;
  `,
  Absolute: styled.div`
    position: absolute;
    right: 0px;
    top: 0px;
    transform: scale(.9);
  `
}
