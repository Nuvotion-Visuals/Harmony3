import { Avatar, Box, Gap, Item, StyleHTML } from "@avsync.live/formation"
import { MessagesResponse } from "redux-tk/pocketbase-types"
import styled from "styled-components"

interface Props {
  message: MessagesResponse
}

export const Message = ({ message }: Props) => {
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
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return `Yesterday at ${new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return new Date(date).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }
  }

  return <S.Message>
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
        <S.Sender>
        { formatDate(message.created) }
        </S.Sender>
      </Item>

      <S.Container>
        <StyleHTML>
          <div dangerouslySetInnerHTML={{ __html: message.text || '' }} />
        </StyleHTML>
      </S.Container>
    </S.Right>
  </S.Message>
}

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