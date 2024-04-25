import { Item, Page } from '@avsync.live/formation'
import { CreateMessage } from 'components/Create/CreateMessage'
import { CreateThread } from 'components/Create/CreateThread'
import { useHarmony_activeChannel, useHarmony_activeChannelId, useHarmony_activeChannelThreads,  useHarmony_activeGroup,  useHarmony_activeSpace,  useHarmony_activeThread,  useHarmony_activeThreadId } from 'redux-tk/harmony/hooks'
import styled from 'styled-components'

export const Channel = ({}) => {
  const activeChannelThreads = useHarmony_activeChannelThreads()
  const activeThreadId = useHarmony_activeThreadId()
  const activeChannelId = useHarmony_activeChannelId()
  const activeChannel = useHarmony_activeChannel()
  const activeGroup = useHarmony_activeGroup()
  const activeSpace = useHarmony_activeSpace()

  return (<>
    <Item
      text={`${activeSpace?.name} > ${activeGroup?.name} > ${activeChannel?.name}`}
    />
    <Page>
      <Item
        pageTitle={activeChannel?.name}
      />
      {
        activeChannelThreads.map(thread =>
          <S.Thread active={thread.id === activeThreadId}>
            <Item
              headingText={thread.name}
            />
              <S.Bottom />
              {
                thread.messages.map(message =>
                  <Item
                    text={message.text}
                  />
                )
              }
            <CreateMessage
                threadId={thread.id}
            />
          </S.Thread>
          
        )
      }
      <CreateThread
        channelId={activeChannelId}
      />
    </Page>
  </>)
}

const S = {
  Thread: styled.div<{
    active: boolean
  }>`
    width: calc(100% - 4px);
    display: flex;
    flex-wrap: wrap;
    border-left: ${props => props.active ? '4px solid var(--F_Primary)' : '4px solid var(--F_Surface_0)'};
    border-radius: .125rem 0 0 .125rem;
    margin: .25rem 0;
    padding: .25rem 0;
    border-bottom: 1px solid var(--F_Surface_0);
  `,
  Bottom: styled.div`
    width: 100%;
    height: .25rem;
  `
}