import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import { harmonyActions } from './slice'
import * as selectors from './selectors'
import { CollectionResponses, UsersResponse } from 'redux-tk/pocketbase-types'
import { isEqual } from 'lodash'

export const useHarmony_activeSpaceId = (): string | null => 
  useSelector(selectors.selectActiveSpaceId, isEqual)

export const useHarmony_activeGroupId = (): string | null => 
  useSelector(selectors.selectActiveGroupId, isEqual)

export const useHarmony_activeChannelId = (): string | null => 
  useSelector(selectors.selectActiveChannelId, isEqual)

export const useHarmony_activeThreadId = (): string | null => 
  useSelector(selectors.selectActiveThreadId, isEqual)

export const useHarmony_activeMessageId = (): string | null => 
  useSelector(selectors.selectActiveMessageId, isEqual)

export const useHarmony_spaces = (): CollectionResponses['spaces'][] => 
  useSelector(selectors.selectSpaces, isEqual)

export const useHarmony_activeSpace = (): CollectionResponses['spaces'] | undefined => 
  useSelector(selectors.selectActiveSpace, isEqual)

export const useHarmony_activeGroup = (): CollectionResponses['groups'] | undefined => 
  useSelector(selectors.selectActiveGroup, isEqual)

export const useHarmony_activeChannel = (): CollectionResponses['channels'] | undefined => 
  useSelector(selectors.selectActiveChannel, isEqual)

export const useHarmony_activeThread = (): CollectionResponses['threads'] | undefined => 
  useSelector(selectors.selectActiveThread, isEqual)

export const useHarmony_activeMessage = (): CollectionResponses['messages'] | undefined => 
  useSelector(selectors.selectActiveMessage, isEqual)

export const useHarmony_activeSpaceIndex = (): number | null => 
  useSelector(selectors.selectActiveSpaceIndex, isEqual)

export const useHarmony_currentUser = (): UsersResponse | null => 
  useSelector(selectors.selectCurrentUser, isEqual)

export const useHarmony_activeSpaceGroups = (): CollectionResponses['groups'][] => {
  return useSelector(selectors.selectActiveSpaceGroups, isEqual)
}

export const useHarmony_activeChannelThreads = (): (CollectionResponses['threads'] & { messages: CollectionResponses['messages'][] })[] => {
  return useSelector(selectors.selectActiveChannelThreads, isEqual)
}

export const useHarmony_currentUserId = (): string | null => 
  useSelector(selectors.selectCurrentUserId, isEqual)

export const useHarmony_setActiveSpaceIndex = () => {
  const dispatch = useDispatch()
  return useCallback((index: number | null) => dispatch(harmonyActions.setActiveSpaceIndex(index)), [dispatch])
}
export const useHarmony_setActiveSpaceId = () => {
  const dispatch = useDispatch()
  return useCallback((payload: string | null) => dispatch(harmonyActions.setActiveSpaceId(payload)), [dispatch])
}
export const useHarmony_setActiveGroupId = () => {
  const dispatch = useDispatch()
  return useCallback((payload: string | null) => dispatch(harmonyActions.setActiveGroupId(payload)), [dispatch])
}
export const useHarmony_setActiveChannelId = () => {
  const dispatch = useDispatch()
  return useCallback((payload: string | null) => dispatch(harmonyActions.setActiveChannelId(payload)), [dispatch])
}
export const useHarmony_setActiveThreadId = () => {
  const dispatch = useDispatch()
  return useCallback((payload: string | null) => dispatch(harmonyActions.setActiveThreadId(payload)), [dispatch])
}
export const useHarmony_setActiveMessageId = () => {
  const dispatch = useDispatch()
  return useCallback((payload: string | null) => dispatch(harmonyActions.setActiveMessageId(payload)), [dispatch])
}
export const useHarmony_setCurrentUser = () => {
  const dispatch = useDispatch()
  return useCallback((payload: UsersResponse | null) => dispatch(harmonyActions.setCurrentUser(payload)), [dispatch])
}
