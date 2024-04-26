import { memo, useEffect, useState } from 'react'
import { Button, Item, RichTextEditor, scrollToElementById } from '@avsync.live/formation'
import { useHarmony_activeChannelId, useHarmony_activeThread, useHarmony_currentUserId, useHarmony_setActiveThreadId } from 'redux-tk/harmony/hooks'
import styled from 'styled-components'
import { pb } from 'redux-tk/pocketbase'

interface Props {
  onNewThreadId: (threadId: string) => void
  activeThreadId?: string
}

export const TextBox = memo(({
  onNewThreadId,
  activeThreadId
}: Props) => {
  const [text, setText] = useState('')
  const setActiveThreadId = useHarmony_setActiveThreadId()
  const activeChannelId = useHarmony_activeChannelId()
  const activeThread = useHarmony_activeThread()
  const userId = useHarmony_currentUserId()

  const sendMessage = async (text) => {
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
          threadid: threadId
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
              square
              minimal
            />
          </Item>
      }
      <S.TextBox>
        <RichTextEditor
          value={text}
          onChange={val => setText(val)}
          outline
          px={1}
          minimal
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
        {
          text !== '' &&
            <S.Absolute>
              <Button
                icon='arrow-up'
                iconPrefix='fas'
                square
                primary
                onClick={() => sendMessage(text)}
                circle
              />
            </S.Absolute>
        }
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
    right: 1px;
    top: 1px;
    transform: scale(.9);
  `
}
