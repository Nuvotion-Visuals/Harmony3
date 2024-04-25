import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import { harmonyActions } from './slice'
import * as selectors from './selectors'

export const useHarmony_activeSpaceId = () => useSelector(selectors.selectActiveSpaceId)
export const useHarmony_activeGroupId = () => useSelector(selectors.selectActiveGroupId)
export const useHarmony_activeThreadId = () => useSelector(selectors.selectActiveThreadId)
export const useHarmony_activeMessageId = () => useSelector(selectors.selectActiveMessageId)
export const useHarmony_spaces = () => useSelector(selectors.selectSpaces)

export const useHarmony_setActiveSpaceId = () => {
  const dispatch = useDispatch()
  return useCallback((payload: string | null) => dispatch(harmonyActions.setActiveSpaceId(payload)), [dispatch])
}
export const useHarmony_setActiveGroupId = () => {
  const dispatch = useDispatch()
  return useCallback((payload: string | null) => dispatch(harmonyActions.setActiveGroupId(payload)), [dispatch])
}
export const useHarmony_setActiveThreadId = () => {
  const dispatch = useDispatch()
  return useCallback((payload: string | null) => dispatch(harmonyActions.setActiveThreadId(payload)), [dispatch])
}
export const useHarmony_setActiveMessageId = () => {
  const dispatch = useDispatch()
  return useCallback((payload: string | null) => dispatch(harmonyActions.setActiveMessageId(payload)), [dispatch])
}