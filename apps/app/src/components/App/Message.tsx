import { Avatar, Box, Button, ContextMenu, Dropdown, Gap, Item, ItemProps, LineBreak, RichTextEditor, StyleHTML, markdownToHTML, onScrollWheelClick, scrollToElementById } from '@avsync.live/formation'
import { memo, useEffect, useState } from 'react'
import { pb } from 'redux-tk/pocketbase'
import { speak } from '../../language/speech'
import styled from 'styled-components'
import { useSpaces_messageById, useSpaces_namesByUserId, useSpaces_setActiveThreadId } from 'redux-tk/spaces/hooks'
import { usePersonas_personaInfoById } from 'redux-tk/personas/hooks'

const formatDate = (date: string): string => {
  const messageDate = new Date(date)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  // Resetting the time part to compare dates only
  now.setHours(0, 0, 0, 0)
  messageDate.setHours(0, 0, 0, 0)
  yesterday.setHours(0, 0, 0, 0)

  if (messageDate.getTime() === now.getTime()) {
    return `Today at ${new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  } 
  else if (messageDate.getTime() === yesterday.getTime()) {
    return `Yesterday at ${new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  } 
  else {
    return new Date(date).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
}

interface MessageInfoProps {
  created: string
  name: string
  dropdownItems: any[] // Define a more specific type if possible
  onSpeak: () => void
}

const MessageInfo: React.FC<MessageInfoProps> = memo(({ 
  name,
  created, 
  dropdownItems,
  onSpeak
}) => {

  return (
    <Item
      subtitle={name}
      disablePadding
      disableBreak
    >
      <Gap autoWidth>
        <S.Sender>
          { formatDate(created) }
        </S.Sender>
        <Box>
          <Button
            icon='play'
            iconPrefix='fas'
            compact
            minimal
            square
            onClick={() => onSpeak()}
          />
          <Dropdown
            icon='ellipsis-h'
            iconPrefix='fas'
            compact
            square
            minimal
            items={dropdownItems}
            maxWidth='10rem'
            disableSearch
          />
        </Box>
      </Gap>
    </Item>
  )
})

interface Props {
  id: string
  index?: number
  expanded?: boolean
  onToggle?: (index: number) => void
  onHandleReply?: () => void
  threadActive?: boolean
}

export const Message = memo(({ 
  id, 
  index,
  expanded,
  onToggle,
  onHandleReply,
  threadActive
}: Props) => {
  const message = useSpaces_messageById(id)
  const namesByUserId = useSpaces_namesByUserId()
  const setActiveThreadId = useSpaces_setActiveThreadId()
  const personaInfo = usePersonas_personaInfoById(message?.personaid)
  
  const [edit, setEdit] = useState(false)
  const [editText, setEditText] = useState(message?.text)

  useEffect(() => {
    if (edit) {
      setEditText(markdownToHTML(message?.text))
    }
  }, [message?.text, edit])

  const handleDelete = async () => {
    try {
      await pb.collection('messages').delete(message.id)
    } 
    catch (error) {
      console.error('Failed to delete message:', error)
      alert('Failed to delete message')
    }
  }

  const handleUpdate = async () => {
    try {
      await pb.collection('messages').update(message.id, { text: editText })
      setEdit(false)
    } 
    catch (error) {
      console.error('Failed to update message:', error)
      alert('Failed to update message')
    }
  }

  const onSpeak = () => {
    speak(message.text, `message_${id}`, () => {})
  }

  const dropdownItems = [
    {
      icon: expanded ? 'chevron-up' : 'chevron-down',
      iconPrefix: 'fas',
      compact: true,
      text: expanded ? 'Thread collapse' : 'Thread expand',
      onClick: (e) => {
        e.stopPropagation()
        onToggle(index ? index : 0)
      },
    },
    {
      icon: 'circle-up',
      iconPrefix: 'fas',
      compact: true,
      text: 'Thread top',
      onClick: (e) => {
        e.stopPropagation()
        scrollToElementById(`thread_${message.threadid}_top`, { behavior: 'smooth'})
      },
    },
    {
      icon: 'circle-down',
      iconPrefix: 'fas',
      compact: true,
      text: 'Thread bottom',
      onClick: (e) => {
        e.stopPropagation()
        scrollToElementById(`thread_${message.threadid}_bottom`, { behavior: 'smooth'})
      },
    },
    {
      children: <LineBreak color='var(--F_Font_Color_Disabled)'/>
    },
    {
      icon: 'arrow-up',
      iconPrefix: 'fas',
      compact: true,
      text: 'Message top',
      onClick: (e) => {
        e.stopPropagation()
        scrollToElementById(`message_${id}_top`, { behavior: 'smooth'})
      },
    },
    {
      icon: 'arrow-down',
      iconPrefix: 'fas',
      compact: true,
      text: 'Message bottom',
      onClick: (e) => {
        e.stopPropagation()
        scrollToElementById(`message_${id}_bottom`, { behavior: 'smooth'})
      },
    },
    {
      children: <LineBreak color='var(--F_Font_Color_Disabled)'/>
    },
    {
      icon: threadActive ? 'times' : 'reply',
      iconPrefix: 'fas',
      compact: true,
      text: threadActive ? 'Exit reply' : 'Reply',
      onClick: (e) => {
        e.stopPropagation()
        threadActive
          ? setActiveThreadId(null)
          : onHandleReply()
      },
    },
    {
      icon: 'edit',
      iconPrefix: 'fas',
      compact: true,
      text: 'Edit',
      onClick: () => setEdit(true)
    },
    {
      icon: 'play',
      iconPrefix: 'fas',
      compact: true,
      text: 'Speak',
      onClick: () => onSpeak()
    },
    {
      children: <LineBreak color='var(--F_Font_Color_Disabled)'/>
    },
    {
      icon: 'trash-alt',
      iconPrefix: 'fas',
      compact: true,
      text: 'Delete',
      onClick: () => handleDelete()
    }
  ] as ItemProps[]

  return <ContextMenu
    dropdownProps={{
      items: dropdownItems,
      maxWidth: '10rem',
      disableSearch: true
    }}
  >
    <div id={`message_${id}_top`} />
    <S.Message onMouseDown={onScrollWheelClick(() => handleDelete())} id={`message_${message.id}`}>
      <S.Left>
        <Avatar
          name={
            message?.assistant
              ? personaInfo?.name
                  ? personaInfo?.name
                  : 'Assistant'
              : namesByUserId[message.userid]
          }
          labelColor={
            message?.assistant
              ? personaInfo?.avatar
                  ? null
                  : 'red'
              : 'green'
          }
          src={
            (message?.assistant && personaInfo?.avatar) 
              ? `http://localhost:8090/api/files/personas/${personaInfo?.id}/${personaInfo?.avatar}` 
              : null
          }
        />
      </S.Left>
      <S.Right>
        <MessageInfo
          key={message.id}
          name={namesByUserId[message.userid]}
          onSpeak={onSpeak}
          created={message.created}
          dropdownItems={dropdownItems}
        />

        <S.Container>
          {
            edit
              ? <Box mt={.5}>
                  <Gap disableWrap>
                    <RichTextEditor
                      outline
                      value={editText}
                      onChange={val => setEditText(val)}
                      px={1}
                      autoFocus
                    />
                    <Box width='var(--F_Input_Height)' wrap mt={1}>
                      <Gap>
                        <Button
                          icon='save'
                          iconPrefix='fas'
                          square
                          compact
                          onClick={() => handleUpdate()}
                        />
                        <Button
                          icon='times'
                          iconPrefix='fas'
                          square
                          compact
                          minimal
                          onClick={() => setEdit(false)}
                        />
                      </Gap>
                    </Box>
                  </Gap>
                </Box>
              : <StyleHTML>
                  <div dangerouslySetInnerHTML={{ __html: markdownToHTML(message.text) || '' }} className='message' />
                </StyleHTML>
          }
        </S.Container>
      </S.Right>
    </S.Message>
    <div id={`message_${id}_bottom`} />
  </ContextMenu>
})

const S = {
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