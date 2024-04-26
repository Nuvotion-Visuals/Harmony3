import { Avatar, Box, Button, ContextMenu, Dropdown, Gap, Item, ItemProps, RichTextEditor, StyleHTML, markdownToHTML, onScrollWheelClick } from '@avsync.live/formation'
import { memo, useState } from 'react'
import { pb } from 'redux-tk/pocketbase'
import { MessagesResponse } from 'redux-tk/pocketbase-types'
import { speak } from '../../language/speech'
import styled from 'styled-components'

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

interface Props {
  message: MessagesResponse
}

export const Message = memo(({ message }: Props) => {
  const [edit, setEdit] = useState(false)
  const [editText, setEditText] = useState(message?.text)

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

  const dropdownItems = [
    {
      icon: 'edit',
      iconPrefix: 'fas',
      compact: true,
      text: 'Edit',
      onClick: () => setEdit(true)
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
      items: dropdownItems
    }}
  >
    <S.Message onMouseDown={onScrollWheelClick(() => handleDelete())} id={`message_${message.id}`}>
      <S.Left>
        <Avatar
          name={message.userid}
          labelColor='gray'
        />
      </S.Left>
      <S.Right>
        <Item
          subtitle={message.userid}
          disablePadding
          disableBreak
        >
          <Gap autoWidth>
            <S.Sender>
              { formatDate(message.created) }
            </S.Sender>
            <Box>
              <Button
                icon='play'
                iconPrefix='fas'
                compact
                minimal
                square
                onClick={() => {
                  speak(message.text, `message_${message.id}`, () => {}, )
                }}
              />
              <Dropdown
                icon='ellipsis-h'
                iconPrefix='fas'
                compact
                square
                minimal
                items={dropdownItems}
              />
            </Box>
          </Gap>
        </Item>
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