import React, { useState } from 'react'
import { chat } from '../../language/chat'
import { Avatar, Box, Button, Gap, Item, LineBreak, StyleHTML, TextInput, markdownToHTML } from '@avsync.live/formation'
import styled from 'styled-components'
import { speak } from '../../language/speech'

const Message = ({
  role,
  content
}) => {
  return (
    <S.Message >
      <S.Left>
        <Avatar
          name={role}
          labelColor='gray'
        />
      </S.Left>
      <S.Right>
        <Item
          subtitle={role}
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
                onClick={() => {
                  speak(content, ``, () => {}, )
                }}
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
}

export const Chat = () => {
  const [messages, setMessages] = useState([])
  const [stream, setStream] = useState([])

  const [message, setMessage] = useState('')

  const sendMessage = () => {
    const newMessages = [
      ...messages,
      { role: 'user', content: message }
    ]
    setMessages(newMessages)
    setMessage('')

    chat({
      messages: newMessages,
      onPartial: response => {
        setStream(prevResponses => [...prevResponses, response.includes('\n\n') ? '\n' : response])
      },
      onComplete: response => {
        const completeAssistantMessage = { role: 'assistant', content: response }
        console.log(response, completeAssistantMessage)
        setMessages(prevHistory => [...prevHistory, completeAssistantMessage])
        console.log(completeAssistantMessage)
        setStream([])
      }
    })
  }

  const clear = () => {
    setMessages([])
    setMessage('')
  }

  return (<>
    <Item
      text='Quick chat'
      absoluteRightChildren
    >
      <Button
        icon='refresh'
        iconPrefix='fas'
        minimal
        compact
        square
        onClick={clear}
      />
    </Item>
    <LineBreak />

    <S.Content>
      <Gap>
        {
          messages.map(message =>
            <Message
              role={message.role}
              content={markdownToHTML(message.content)}
            />)
        }
        {
          stream.length > 0 && <Message
            role={'assistant'}
            content={markdownToHTML(stream.join(''))}
          />
        }
      </Gap>
    </S.Content>

    <TextInput
      value={message}
      placeholder='Chat'
      onChange={val => setMessage(val)}
      onEnter={sendMessage}
      secondaryIcon='arrow-up'
      iconPrefix='fas'
      secondaryOnClick={sendMessage}
    />
  </>)
}


const S = {
  Content: styled.div`
    width: 100%;
    height: calc(100vh - 70px);
    overflow-y: auto;
  `,
  Message: styled.div`
    width: calc(100% - 1rem);
    display: flex;
    gap: .25rem;
    padding-left: 1rem;
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
  Sender: styled.div`
    font-size: 12px;
    color: var(--F_Font_Color_Disabled);
  `
}