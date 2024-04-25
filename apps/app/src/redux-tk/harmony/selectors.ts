import { CollectionResponses } from 'redux-tk/pocketbase-types'

import { State } from '../store'
export const selectActiveSpaceId = (state: State): string | null => state.harmony.activeSpaceId
export const selectActiveGroupId = (state: State): string | null => state.harmony.activeGroupId
export const selectActiveThreadId = (state: State): string | null => state.harmony.activeThreadId
export const selectActiveMessageId = (state: State): string | null => state.harmony.activeMessageId
export const selectActiveSpaceIndex = (state: State): number | null => state.harmony.activeSpaceIndex
export const selectActiveSpaceGroups = (state: State): CollectionResponses['groups'][] => {
  const activeSpaceId = state.harmony.activeSpaceId
  return state.harmony.groups.filter(group => group.spaceid === activeSpaceId)
}

export const selectSpaces = (state: State): CollectionResponses['spaces'][] => state.harmony.spaces;

export const selectActiveSpace = (state: State): CollectionResponses['spaces'] | undefined =>
  state.harmony.spaces.find(space => space.id === state.harmony.activeSpaceId);

export const selectGroupsByActiveSpace = (state: State): CollectionResponses['groups'][] =>
  state.harmony.groups.filter(group => group.spaceid === state.harmony.activeSpaceId);

export const selectActiveGroup = (state: State): CollectionResponses['groups'] | undefined =>
  state.harmony.groups.find(group => group.id === state.harmony.activeGroupId);

export const selectChannelsByActiveGroup = (state: State): CollectionResponses['channels'][] =>
  state.harmony.channels.filter(channel => channel.groupid === state.harmony.activeGroupId);

export const selectActiveChannel = (state: State): CollectionResponses['channels'] | undefined =>
  state.harmony.channels.find(channel => channel.id === state.harmony.activeChannelId);

export const selectThreadsByActiveChannel = (state: State): CollectionResponses['threads'][] =>
  state.harmony.threads.filter(thread => thread.channelid === state.harmony.activeChannelId);

export const selectActiveThread = (state: State): CollectionResponses['threads'] | undefined =>
  state.harmony.threads.find(thread => thread.id === state.harmony.activeThreadId);

export const selectMessagesByActiveThread = (state: State): CollectionResponses['messages'][] =>
  state.harmony.messages.filter(message => message.threadid === state.harmony.activeThreadId);

export const selectActiveMessage = (state: State): CollectionResponses['messages'] | undefined =>
  state.harmony.messages.find(message => message.id === state.harmony.activeMessageId);
