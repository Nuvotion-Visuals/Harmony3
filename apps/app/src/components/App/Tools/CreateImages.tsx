import React, { memo, useEffect, useState } from 'react'
import { chat } from 'language/chat'
import { Avatar, Box, Button, Dropdown, Gap, Item, LoadingSpinner, Spacer, StyleHTML, markdownToHTML, scrollToElementById } from '@avsync.live/formation'
import styled from 'styled-components'
import { speak } from 'language/speech'
import { TextBox } from 'components/App/TextBox' 
import { useSpaces_currentUserId, useSpaces_usersById } from 'redux-tk/spaces/hooks'
import { usePersonas_activePersona } from 'redux-tk/personas/hooks'
import { createImage } from 'vision/createImage'
import useDynamicHeight from 'components/Hooks/useDynamicHeight'

const Message = memo(({
  role,
  content,
  index,
  imageUrl
}: {
  role: string,
  content: string,
  index: number,
  imageUrl?: string
}) => {
  const currentUserId = useSpaces_currentUserId()
  const usersById = useSpaces_usersById()
  const name = usersById?.[currentUserId]?.name

  return (
    <S.Message id={`images_message_${index}`}>
      <S.Left>
        <Avatar
          name={
            role === 'user' 
              ? name 
              : role === 'system'
                ? 'System'
                : 'Assistant'
          }
          labelColor={
            role === 'user' 
              ? 'green' 
              : undefined
          }
          icon={
            role === 'user' 
              ? undefined 
              : role === 'system'
                ? 'image'
                : 'pencil'
          }
        />
      </S.Left>
      <S.Right>
        <Item
          subtitle={
            role === 'user' 
              ? name 
              : role === 'system'
                ? 'System'
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
                onClick={() => speak(content, `images_message_${index}`, () => {})}
              />
            </Box>
          </Gap>
        </Item>
        <S.Container>
          <StyleHTML>
            <div dangerouslySetInnerHTML={{ __html: content || '' }} className='message' />
          </StyleHTML>
          <Gap gap={.25}>
            {
              imageUrl && <S.Image src={imageUrl} />
            }
          </Gap>
        </S.Container>
      </S.Right>
    </S.Message>
  )
})

export const CreateImages = () => {
  const [messages, setMessages] = useState(JSON.parse(localStorage.getItem('tools_createImages_messages')) || [])

  useEffect(() => {
    localStorage.setItem('tools_createImages_messages', JSON.stringify(messages))
  }, [messages])

  const [stream, setStream] = useState('')
  const [loading, setLoading] = useState(false)

  const activePersona = usePersonas_activePersona()

  useEffect(() => {
    scrollToElementById('images_bottom', { behavior: 'auto', block: 'end'})
  }, [messages])

  const { ref, height } = useDynamicHeight('createImage_height', 82)

  const [size, setSize] = useState('1024x1024')
  const [model, _] = useState('dall-e-3')
  const [n, __] = useState(1)
  const [quality, setQuality] = useState('standard')

  const sendMessage = (message: string) => {
    const newMessages = [
      { 
        role: 'system', 
        content: `
          You are an image generator. The user will request an image with a simple prompt, you will add detail that helps the user achieve the desired result. 
          Sometimes the system will automatically update the prompt. Sometimes the user will have feedback for you, in which case you should update the prompt.
          You only ever respond with an image prompt, no additional commentary.
        ` 
      },
      ...messages,
      { role: 'user', content: message }
    ]
    setMessages(newMessages)

    chat({
      retrieve: false,
      messages: newMessages.map(({ role, content}) => ({ role, content })),
      provider: activePersona?.provider,
      model: activePersona?.model,
      onPartial: response => {
        setStream(response)
        scrollToElementById('images_bottom', { behavior: 'auto', block: 'end'})
      },
      onComplete: response => {
        setLoading(true)
        const completeAssistantMessage = { role: 'assistant', content: response }
        setMessages(prevHistory => [...prevHistory, completeAssistantMessage])
        setStream('')
        createImage(
          {
            prompt: response,
            size,
            model,
            n
          }, 
          (data) => {
            const completeSystemMessage = { 
              role: 'system', 
              content: data.prompt || response, 
              imageUrl: `http://localhost:8090/api/files/images/${data.id}/${data.file}` 
            }
            setMessages(prevMessages => [...prevMessages, completeSystemMessage])
            
            setLoading(false)
          },
          () => {
            alert('Image creation failed')
            setLoading(false)
          }
        )
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
                scrollToElementById('images_top', { behavior: 'smooth'})
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
                scrollToElementById('images_bottom', { behavior: 'smooth', block: 'end'})
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
    <S.Content height={height}>
      <div id='images_top'></div>
      <Gap>
        {
          messages.filter(message => !message.content.includes('You are an image generator')).map((message, index) =>
            <Message
              role={message.role}
              content={markdownToHTML(message.content)}
              imageUrl={message?.imageUrl}
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
        {
          loading && <Box width={'100%'}>
            <LoadingSpinner />
          </Box>
        }
      </Gap>
      <div id='images_bottom'></div>
    </S.Content>

    <S.TextBoxContainer ref={ref}>
      <Box width='100%'>
        <Dropdown
          text={size}
          compact
          maxWidth='5.5rem'
          minimal
          items={[
            {
              text: '1024x1024',
              onClick: () => setSize('1024x1024'),
              active: size === '1024x1024',
              compact: true
            },
            {
              text: '1792x1024',
              onClick: () => setSize('1792x1024'),
              active: model === '1792x1024',
              compact: true
            },
            {
              text: '1024x1792',
              onClick: () => setSize('1024x1792'),
              active: model === '1024x1792',
              compact: true
            }
          ]}
        />
        <Dropdown
          text={quality === 'standard' ? 'SD' : 'HD'}
          compact
          minimal
          maxWidth='2.25rem'
          items={[
            {
              text: 'SD',
              onClick: () => setQuality('standard'),
              active: quality === 'standard',
              compact: true
            },
            {
              text: 'HD',
              onClick: () => setQuality('hd'),
              active: quality === 'hd',
              compact: true
            },
          ]}
        />
        <Spacer />
      </Box>
       
      <TextBox
        onSend={(msg) => sendMessage(msg)}
        disablePersonas
        placeholder='Image prompt'
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
    flex-wrap: wrap;
    justify-content: center;
    padding: .25rem 0;
  `,
  Image: styled.img`
    width: 100%;
  `
}
