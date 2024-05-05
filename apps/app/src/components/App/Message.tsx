import { Avatar, Box, Button, ContextMenu, Dropdown, Gap, Item, ItemProps, LineBreak, RichTextEditor, StyleHTML, markdownToHTML, scrollToElementById } from '@avsync.live/formation'
import { memo, useEffect, useState } from 'react'
import { pb } from 'redux-tk/pocketbase'
import { speak } from '../../language/speech'
import styled from 'styled-components'
import { useSpaces_messageById, useSpaces_setActiveThreadId, useSpaces_usersById } from 'redux-tk/spaces/hooks'
import { usePersonas_personaInfoById } from 'redux-tk/personas/hooks'
import { formatDate } from 'utils/formatDate'

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
  const usersById = useSpaces_usersById()
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

  const messageUser = usersById[message.userid]

  const name = message?.assistant
    ? personaInfo?.name
        ? personaInfo?.name
        : 'Assistant'
    : messageUser?.name

  return <ContextMenu
    dropdownProps={{
      items: dropdownItems,
      maxWidth: '10rem',
      disableSearch: true
    }}
  >
    <div id={`message_${id}_top`} />
    <S.Message id={`message_${message.id}`}>
      <S.Left>
        <Avatar
          name={name}
          labelColor={
            message?.assistant
              ? personaInfo?.avatar
                  ? null
                  : 'red'
              : messageUser?.avatar
                ? null
                : 'green'
          }
          src={
            message?.assistant
              ? (message?.assistant && personaInfo?.avatar) 
                  ? `http://localhost:8090/api/files/personas/${personaInfo?.id}/${personaInfo?.avatar}` 
                  : null
              : messageUser?.avatar
                ? `http://localhost:8090/api/files/users/${messageUser?.id}/${messageUser?.avatar}` 
                : null
          }
        />
      </S.Left>
      <S.Right>
        <MessageInfo
          key={message.id}
          name={name}
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
                          icon='check'
                          iconPrefix='fas'
                          square
                          compact
                          primary
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