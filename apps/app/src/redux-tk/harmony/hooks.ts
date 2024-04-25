import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import { harmonyActions } from './slice'
import * as selectors from './selectors'
import { CollectionResponses, UsersResponse } from 'redux-tk/pocketbase-types'

export const useHarmony_activeSpaceId = (): string | null => 
  useSelector(selectors.selectActiveSpaceId)

export const useHarmony_activeGroupId = (): string | null => 
  useSelector(selectors.selectActiveGroupId)

export const useHarmony_activeChannelId = (): string | null => 
  useSelector(selectors.selectActiveChannelId)

export const useHarmony_activeThreadId = (): string | null => 
  useSelector(selectors.selectActiveThreadId)

export const useHarmony_activeMessageId = (): string | null => 
  useSelector(selectors.selectActiveMessageId)

export const useHarmony_spaces = (): CollectionResponses['spaces'][] => 
  useSelector(selectors.selectSpaces)

export const useHarmony_activeSpace = (): CollectionResponses['spaces'] | undefined => 
  useSelector(selectors.selectActiveSpace)

export const useHarmony_activeGroup = (): CollectionResponses['groups'] | undefined => 
  useSelector(selectors.selectActiveGroup)

export const useHarmony_activeChannel = (): CollectionResponses['channels'] | undefined => 
  useSelector(selectors.selectActiveChannel)

export const useHarmony_activeThread = (): CollectionResponses['threads'] | undefined => 
  useSelector(selectors.selectActiveThread)

export const useHarmony_activeMessage = (): CollectionResponses['messages'] | undefined => 
  useSelector(selectors.selectActiveMessage)

export const useHarmony_activeSpaceIndex = (): number | null => 
  useSelector(selectors.selectActiveSpaceIndex)

export const useHarmony_currentUser = (): UsersResponse | null => 
  useSelector(selectors.selectCurrentUser)

export const useHarmony_activeSpaceGroups = (): CollectionResponses['groups'][] => {
  return useSelector(selectors.selectActiveSpaceGroups)
}

export const useHarmony_activeChannelThreads = (): (CollectionResponses['threads'] & { messages: CollectionResponses['messages'][] })[] => {
  return useSelector(selectors.selectActiveChannelThreads)
}

export const useHarmony_currentUserId = (): string | null => 
  useSelector(selectors.selectCurrentUserId)

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
