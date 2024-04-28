import { CollectionResponses, UsersResponse } from 'redux-tk/pocketbase-types'

import { State } from '../store'
export const selectActiveSpaceId = (state: State): string | null => state.spaces.activeSpaceId
export const selectActiveGroupId = (state: State): string | null => state.spaces.activeGroupId
export const selectActiveChannelId = (state: State): string | null => state.spaces.activeChannelId
export const selectActiveThreadId = (state: State): string | null => state.spaces.activeThreadId
export const selectActiveMessageId = (state: State): string | null => state.spaces.activeMessageId
export const selectActiveSpaceIndex = (state: State): number | null => state.spaces.activeSpaceIndex
export const selectCurrentUser = (state: State): UsersResponse | null => state.spaces.currentUser
export const selectCurrentUserId = (state: State): string | null => state.spaces.currentUser?.id || null

export const selectActiveSpaceGroups = (state: State): (CollectionResponses['groups'] & { channels: CollectionResponses['channels'][] })[] => {
  const activeSpaceId = state.spaces.activeSpaceId
  const groups = state.spaces.groups.filter(group => group.spaceid === activeSpaceId)
  return groups.map(group => ({
    ...group,
    channels: state.spaces.channels.filter(channel => channel.groupid === group.id)
  }))
}

export const selectActiveChannelThreads = (state: State): (CollectionResponses['threads'] & { messageIds: string[] })[] => {
  const activeChannelId = state.spaces.activeChannelId
  const threads = state.spaces.threads.filter(thread => thread.channelid === activeChannelId)
  return threads.map(thread => ({
    ...thread,
    messageIds: state.spaces.messages.filter(message => message.threadid === thread.id).map(message => message.id)
  }))
}

export const selectSpaces = (state: State): CollectionResponses['spaces'][] => state.spaces.spaces;

export const selectActiveSpace = (state: State): CollectionResponses['spaces'] | undefined =>
  state.spaces.spaces.find(space => space.id === state.spaces.activeSpaceId);

export const selectGroupsByActiveSpace = (state: State): CollectionResponses['groups'][] =>
  state.spaces.groups.filter(group => group.spaceid === state.spaces.activeSpaceId);

export const selectActiveGroup = (state: State): CollectionResponses['groups'] | undefined =>
  state.spaces.groups.find(group => group.id === state.spaces.activeGroupId);

export const selectChannelsByActiveGroup = (state: State): CollectionResponses['channels'][] =>
  state.spaces.channels.filter(channel => channel.groupid === state.spaces.activeGroupId);

export const selectActiveChannel = (state: State): CollectionResponses['channels'] | undefined =>
  state.spaces.channels.find(channel => channel.id === state.spaces.activeChannelId);

export const selectThreadsByActiveChannel = (state: State): CollectionResponses['threads'][] =>
  state.spaces.threads.filter(thread => thread.channelid === state.spaces.activeChannelId);

export const selectActiveThread = (state: State): CollectionResponses['threads'] | undefined =>
  state.spaces.threads.find(thread => thread.id === state.spaces.activeThreadId);

export const selectMessagesByActiveThread = (state: State): CollectionResponses['messages'][] =>
  state.spaces.messages.filter(message => message.threadid === state.spaces.activeThreadId);

export const selectActiveMessage = (state: State): CollectionResponses['messages'] | undefined =>
  state.spaces.messages.find(message => message.id === state.spaces.activeMessageId);

export const selectMessageById = (id: string) => (state: State) => state.spaces.messages.find(message => message.id === id)

export const selectMessagesByThreadId = (threadId: string) => (state: State): CollectionResponses['messages'][] =>
  state.spaces.messages.filter(message => message.threadid === threadId)

export const selectThreadMessagesWithRole = (threadId: string) => (state: State): { role: string, content: string }[] =>
  state.spaces.messages
    .filter(message => message.threadid === threadId)
    .map(message => ({
      role: message.userid !== state.spaces.currentUser?.id ? 'user' : 'assistant',
      content: message.text || ''
    }))

export const selectActiveChannelThreadNamesAndDescriptions = (state: State): { name: string, description: string }[] => {
  const activeChannelId = state.spaces.activeChannelId
  return state.spaces.threads
    .filter(thread => thread.channelid === activeChannelId)
    .map(thread => ({
      name: thread.name || '',
      description: thread.description || ''
    }))
}

export const selectActiveGroupChannelNamesAndDescriptions = (state: State): { name: string, description: string }[] => {
  const activeGroupId = state.spaces.activeGroupId
  return state.spaces.channels
    .filter(channel => channel.groupid === activeGroupId)
    .map(channel => ({
      name: channel.name || '',
      description: channel.description || ''
    }))
}

export const selectActiveSpaceGroupsInfo = (state: State): { name: string, description: string, id: string }[] => {
  const activeSpaceId = state.spaces.activeSpaceId
  return state.spaces.groups
    .filter(group => group.spaceid === activeSpaceId)
    .map(group => ({
      name: group.name || '',
      description: group.description || '',
      id: group.id || ''
    }))
}

export const selectNamesByUserId = (state: State): Record<string, string> => {
  return state.spaces.users.reduce((names, user) => {
    names[user.id] = user.name
    return names
  }, {} as Record<string, string>)
}

export const selectActiveGroupChannelsInfo = (state: State): { name: string, description: string, id: string }[] => {
  const activeGroupId = state.spaces.activeGroupId
  return state.spaces.channels
    .filter(channel => channel.groupid === activeGroupId)
    .map(channel => ({
      name: channel.name || '',
      description: channel.description || '',
      id: channel.id || '',
    }))
}

export const selectActiveChannelThreadsInfo = (state: State): { name: string, description: string, id: string }[] => {
  const activeChannelId = state.spaces.activeChannelId
  return state.spaces.threads
    .filter(thread => thread.channelid === activeChannelId)
    .map(thread => ({
      name: thread.name || '',
      description: thread.description || '',
      id: thread.id || ''
    }))
}