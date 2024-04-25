import { CollectionResponses } from 'redux-tk/pocketbase-types'

import { State } from '../store'
export const selectActiveSpaceId = (state: State): string | null => state.harmony.activeSpaceId
export const selectActiveGroupId = (state: State): string | null => state.harmony.activeGroupId
export const selectActiveThreadId = (state: State): string | null => state.harmony.activeThreadId
export const selectActiveMessageId = (state: State): string | null => state.harmony.activeMessageId

export const selectSpaces = (state: State): CollectionResponses['spaces'][] => state.harmony.spaces