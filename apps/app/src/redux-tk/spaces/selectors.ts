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

export const selectActiveSpaceGroups = (state: State): (CollectionResponses['groups'] & { channels: (CollectionResponses['channels'] & { threadsCount: number })[] })[] => {
  const activeSpaceId = state.spaces.activeSpaceId
  const groups = state.spaces.groups.filter(group => group.spaceid === activeSpaceId)
  return groups.map(group => ({
    ...group,
    channels: state.spaces.channels
      .filter(channel => channel.groupid === group.id)
      .map(channel => ({
        ...channel,
        threadsCount: state.spaces.threads.filter(thread => thread.channelid === channel.id).length
      }))
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

export const selectUsersById = (state: State): Record<string, UsersResponse> => {
  return state.spaces.users.reduce((usersById, user) => {
    usersById[user.id] = user
    return usersById
  }, {} as Record<string, UsersResponse>)
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


export const selectCountBySpaceId = (state: State): Record<string, { groups: number; channels: number; threads: number; messages: number }> => {
  const countsBySpaceId: Record<string, { groups: number; channels: number; threads: number; messages: number }> = {}

  // Initialize space counts structure
  state.spaces.groups.forEach(group => {
    if (!countsBySpaceId[group.spaceid]) {
      countsBySpaceId[group.spaceid] = { groups: 0, channels: 0, threads: 0, messages: 0 }
    }
    countsBySpaceId[group.spaceid].groups++
  })

  // Create mappings for quick lookup
  const groupIdToSpaceId: Record<string, string> = {}
  state.spaces.groups.forEach(group => {
    groupIdToSpaceId[group.id] = group.spaceid
  })

  const channelIdToGroupId: Record<string, string> = {}
  state.spaces.channels.forEach(channel => {
    channelIdToGroupId[channel.id] = channel.groupid
    if (groupIdToSpaceId[channel.groupid]) {
      countsBySpaceId[groupIdToSpaceId[channel.groupid]].channels++
    }
  })

  const threadIdToChannelId: Record<string, string> = {}
  state.spaces.threads.forEach(thread => {
    threadIdToChannelId[thread.id] = thread.channelid
    const groupId = channelIdToGroupId[thread.channelid]
    if (groupId && groupIdToSpaceId[groupId]) {
      countsBySpaceId[groupIdToSpaceId[groupId]].threads++
    }
  })

  // Calculate messages count using the mappings
  state.spaces.messages.forEach(message => {
    const channelId = threadIdToChannelId[message.threadid]
    const groupId = channelId ? channelIdToGroupId[channelId] : undefined
    const spaceId = groupId ? groupIdToSpaceId[groupId] : undefined
    if (spaceId) {
      countsBySpaceId[spaceId].messages++
    }
  })

  return countsBySpaceId
}

export const selectCountsByGroupId = (state: State): Record<string, { channels: number; threads: number; messages: number }> => {
  const countsByGroupId: Record<string, { channels: number; threads: number; messages: number }> = {}

  state.spaces.groups.forEach(group => {
    countsByGroupId[group.id] = { channels: 0, threads: 0, messages: 0 }
  })

  state.spaces.channels.forEach(channel => {
    if (countsByGroupId[channel.groupid]) {
      countsByGroupId[channel.groupid].channels++
    }
  })

  state.spaces.threads.forEach(thread => {
    const groupId = state.spaces.channels.find(channel => channel.id === thread.channelid)?.groupid
    if (groupId && countsByGroupId[groupId]) {
      countsByGroupId[groupId].threads++
    }
  })

  state.spaces.messages.forEach(message => {
    const channelId = state.spaces.threads.find(thread => thread.id === message.threadid)?.channelid
    const groupId = channelId ? state.spaces.channels.find(channel => channel.id === channelId)?.groupid : undefined
    if (groupId && countsByGroupId[groupId]) {
      countsByGroupId[groupId].messages++
    }
  })

  return countsByGroupId
}

export const selectCountByChannelId = (state: State): Record<string, { threads: number; messages: number }> => {
  const countsByChannelId: Record<string, { threads: number; messages: number }> = {}

  state.spaces.channels.forEach(channel => {
    countsByChannelId[channel.id] = { threads: 0, messages: 0 }
  })

  state.spaces.threads.forEach(thread => {
    if (countsByChannelId[thread.channelid]) {
      countsByChannelId[thread.channelid].threads++
    }
  })

  state.spaces.messages.forEach(message => {
    const channelId = state.spaces.threads.find(thread => thread.id === message.threadid)?.channelid
    if (channelId && countsByChannelId[channelId]) {
      countsByChannelId[channelId].messages++
    }
  })

  return countsByChannelId
}

export const selectActiveChannelInfo = (state: State): { name: string; description: string; id: string } | undefined => {
  const activeChannel = state.spaces.channels.find(channel => channel.id === state.spaces.activeChannelId)
  return activeChannel ? {
    name: activeChannel.name || '',
    description: activeChannel.description || '',
    id: activeChannel.id
  } : null
}