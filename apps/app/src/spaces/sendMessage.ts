import { pb } from 'redux-tk/pocketbase'
import { store } from 'redux-tk/store'
import * as selectors from 'redux-tk/spaces/selectors'
import { spacesActions as actions } from 'redux-tk/spaces/slice'

export const sendMessage = async (text: string, newThread?: boolean) => {
  if (!text.trim()) return

  const state = store.getState()
  const activeThreadId = selectors.selectActiveThreadId(state)
  const activeChannelId = selectors.selectActiveChannelId(state)
  const userId = selectors.selectCurrentUserId(state)

  let threadId = activeThreadId

  if ((!threadId && activeChannelId && userId) || newThread) {
    // Create a new thread since there's no active thread
    const threadData = {
      name: 'New thread',
      userid: userId,
      channelid: activeChannelId
    }
    try {
      const response = await pb.collection('threads').create(threadData)
      threadId = response.id
      store.dispatch(actions.setActiveThreadId(threadId))
    } 
    catch (error) {
      console.error('Failed to create thread:', error)
      alert('Error creating thread. Check console for details.')
      return
    }
  }

  if (threadId) {
    try {
      await pb.collection('messages').create({
        text,
        userid: userId,
        threadid: threadId
      })
    } 
    catch (error) {
      console.error('Failed to send message:', error)
      alert('Error sending message. Check console for details.')
    }
  }
}