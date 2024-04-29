import React, { memo, useEffect, useState } from 'react'
import { chat } from 'language/chat'
import { Avatar, Box, Button, Gap, Item, StyleHTML, markdownToHTML, scrollToElementById } from '@avsync.live/formation'
import styled from 'styled-components'
import { speak } from 'language/speech'
import { TextBox } from 'components/App/TextBox' 
import { useSpaces_currentUserId, useSpaces_namesByUserId } from 'redux-tk/spaces/hooks'
import { usePersonas_activePersona } from 'redux-tk/personas/hooks'

const Message = memo(({
  role,
  content,
  index,
}: {
  role: string,
  content: string,
  index: number,
}) => {
  const currentUserId = useSpaces_currentUserId()
  const activePersona = usePersonas_activePersona()
  const namesByUserId = useSpaces_namesByUserId()
  const name = namesByUserId?.[currentUserId]

  return (
    <S.Message id={`quickchat_message_${index}`}>
      <S.Left>
        <Avatar
          name={
            role === 'user' 
              ? name 
              : activePersona?.name
                ? activePersona?.name
                : 'Assistant'
          }
          labelColor={
            role === 'user' 
              ? 'green' 
              : activePersona?.avatar ? null : 'red'
          }
          src={(role === 'assistant' && activePersona?.avatar) ? `http://localhost:8090/api/files/personas/${activePersona?.id}/${activePersona?.avatar}` : null}
        />
      </S.Left>
      <S.Right>
        <Item
          subtitle={
            role === 'user' 
              ? name 
              : activePersona?.name
                ? activePersona?.name
                : 'Assistant'
          }
          disablePadding
          disableBreak
        >
          <Gap autoWidth>
            <Box>
              <Button
                icon='play'
                iconPrefix='fas'
                compact
                minimal
                square
                onClick={() => speak(content, `quickchat_message_${index}`, () => {})}
              />
            </Box>
          </Gap>
        </Item>
        <S.Container>
          <StyleHTML>
            <div dangerouslySetInnerHTML={{ __html: content || '' }} className='message' />
          </StyleHTML>
        </S.Container>
      </S.Right>
    </S.Message>
  )
})

export const QuickChat = () => {
  const [messages, setMessages] = useState(JSON.parse(localStorage.getItem('tools_quickChat_messages')) || [])
  const [stream, setStream] = useState('')

  useEffect(() => {
    localStorage.setItem('tools_quickChat_messages', JSON.stringify(messages))
  }, [messages])

  const [textBoxHeight, setTextBoxHeight] = useState(0)
  const textBoxRef = React.createRef<HTMLDivElement>()

  const activePersona = usePersonas_activePersona()

  useEffect(() => {
    scrollToElementById('quickchat_bottom', { behavior: 'auto', block: 'end'})
  }, [messages])

  useEffect(() => {
    const updateHeight = () => {
      if (textBoxRef.current) {
        const newHeight = window.innerHeight - textBoxRef.current.clientHeight - 26 - 16 - 40
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

    updateHeight()

    return () => {
      resizeObserver.disconnect()
    }
  }, [textBoxRef])

  const sendMessage = (message: string) => {
    const newMessages = [
      ...[{ role: 'system', content: `Your name: ${activePersona?.name}, System message: ${activePersona?.systemmessage}`}].filter(_ => activePersona?.id),
      ...messages,
      { role: 'user', content: message }
    ]
    setMessages(newMessages)

    chat({
      messages: newMessages,
      provider: activePersona?.provider,
      model: activePersona?.model,
      onPartial: response => {
        setStream(response)
        scrollToElementById('quickchat_bottom', { behavior: 'auto', block: 'end'})
      },
      onComplete: response => {
        const completeAssistantMessage = { role: 'assistant', content: response }
        setMessages(prevHistory => [...prevHistory, completeAssistantMessage])
        setStream('')
      }
    })
  }

  const clear = () => {
    setMessages([])
  }

  return (<>
    <Box py={.5}>
      <Item
        compact
      >
        <Gap autoWidth>
          <Box>
            <Button
              icon={'arrow-up'}
              iconPrefix='fas'
              compact
              square
              minimal
              onClick={(e) => {
                e.stopPropagation()
                scrollToElementById('quickchat_top', { behavior: 'smooth'})
              }}
              title='Scroll to top'
            />
            <Button
              icon={'arrow-down'}
              iconPrefix='fas'
              compact
              square
              minimal
              onClick={(e) => {
                e.stopPropagation()
                scrollToElementById('quickchat_bottom', { behavior: 'smooth', block: 'end'})
              }}
              title='Scroll to bottom'
            />
          </Box>
        <Button
          icon='eraser'
          iconPrefix='fas'
          text='Clear'
          minimal
          compact
          onClick={clear}
        />
        </Gap>
      </Item>
    </Box>
    <S.Content height={textBoxHeight}>
      <div id='quickchat_top'></div>
      <Gap>
        {
          messages.filter(message => message.role !== 'system').map((message, index) =>
            <Message
              role={message.role}
              content={markdownToHTML(message.content)}
              index={index}
            />)
        }
        {
          stream.length > 0 && <Message
            role={'assistant'}
            content={markdownToHTML(stream)}
            index={messages.length}
          />
        }
      </Gap>
      <div id='quickchat_bottom'></div>
    </S.Content>

    <S.TextBoxContainer ref={textBoxRef}>
      <TextBox
        onSend={(msg) => sendMessage(msg)}
      />
    </S.TextBoxContainer>
  </>)
}

const S = {
  Content: styled.div<{ height: number }>`
    width: 100%;
    height: ${props => `calc(${props.height}px - 2rem)`};
    padding-bottom: 2rem;
    overflow-y: auto;
    overflow-x: hidden;
  `,
  Message: styled.div`
    width: calc(100% - 1rem);
    display: flex;
    gap: .25rem;
    padding-left: .5rem;
    margin-bottom: .5rem;
  `,
  Left: styled.div`
    width: 2rem;
  `,
  Right: styled.div`
    width: calc(100% - 2rem);
  `,
  Container: styled.div`
    margin-top: -.5rem;
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