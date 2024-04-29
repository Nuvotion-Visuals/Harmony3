import React, { memo, useEffect, useState } from 'react'
import { chat } from 'language/chat'
import { Avatar, Box, Button, Gap, Item, LoadingSpinner, StyleHTML, markdownToHTML, scrollToElementById } from '@avsync.live/formation'
import styled from 'styled-components'
import { speak } from 'language/speech'
import { TextBox } from 'components/App/TextBox' 
import { useSpaces_currentUserId, useSpaces_namesByUserId } from 'redux-tk/spaces/hooks'
import { usePersonas_activePersona } from 'redux-tk/personas/hooks'
import { createImages } from 'vision/createImages'

const Message = memo(({
  role,
  content,
  index,
  imageUrls
}: {
  role: string,
  content: string,
  index: number,
  imageUrls?: string[]
}) => {
  const currentUserId = useSpaces_currentUserId()
  const activePersona = usePersonas_activePersona()
  const namesByUserId = useSpaces_namesByUserId()
  const name = namesByUserId?.[currentUserId]

  return (
    <S.Message id={`images_message_${index}`}>
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
              imageUrls?.map(imageUrl => <S.Image src={imageUrl} />)
            }
          </Gap>
        </S.Container>
      </S.Right>
    </S.Message>
  )
})

export const CreateImages = () => {
  const [messages, setMessages] = useState([])
  const [stream, setStream] = useState('')
  const [loading, setLoading] = useState(false)

  const [textBoxHeight, setTextBoxHeight] = useState(0)
  const textBoxRef = React.createRef<HTMLDivElement>()

  const activePersona = usePersonas_activePersona()

  useEffect(() => {
    scrollToElementById('images_bottom', { behavior: 'auto', block: 'end'})
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
    setLoading(true)
    const newMessages = [
      { 
        role: 'system', 
        content: `
          You are in image generator. The user will request an image with a simple prompt, you will add detail that helps the user achieve the desired result. 
          Sometimes the system will automatically update the prompt. Sometimes the user will have feedback for you, in which case you should update the prompt.
          You only ever respond with an image prompt, no additional commentary.
        ` 
      },
      ...messages,
      { role: 'user', content: message }
    ]
    setMessages(newMessages)

    chat({
      messages: newMessages.map(({ role, content}) => ({ role, content })),
      provider: activePersona?.provider,
      model: activePersona?.model,
      onPartial: response => {
        setStream(response)
        scrollToElementById('images_bottom', { behavior: 'auto', block: 'end'})
      },
      onComplete: response => {
        const completeAssistantMessage = { role: 'assistant', content: response }
        setMessages(prevHistory => [...prevHistory, completeAssistantMessage])
        setStream('')
        createImages(
          {
            prompt: response,
            size: '1024x1024',
            model: 'dall-e-3',
            n: 1
          }, 
          (data) => {
            const image = data?.[0]
            if (image) {
              const completeSystemMessage = { role: 'system', content: image?.revised_prompt || response, imageUrls: [image.url] }
              setMessages(prevMessages => [...prevMessages, completeSystemMessage])
            }
            setLoading(false)
          },
          (e) => {
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
    <S.Content height={textBoxHeight}>
      <div id='images_top'></div>
      <Gap>
        {
          messages.slice(1)?.map((message, index) =>
            <Message
              role={message.role}
              content={markdownToHTML(message.content)}
              imageUrls={message?.imageUrls}
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

    <S.TextBoxContainer ref={textBoxRef}>
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
    justify-content: center;
    padding: .25rem 0;
  `,
  Image: styled.img`
    width: 100%;
  `
}
