// useVoiceHooks.ts
import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import { voiceActions } from './slice'
import * as selectors from './selectors'
import { isEqual } from 'lodash'

export const useVoice_currentSpeakerId = (): string => 
  useSelector(selectors.selectCurrentSpeakerId, isEqual)

export const useVoice_paused = (): boolean => 
  useSelector(selectors.selectPaused, isEqual)

export const useVoice_currentlySpeaking = (): string => 
  useSelector(selectors.selectCurrentlySpeaking, isEqual)

export const useVoice_speed = (): number => 
  useSelector(selectors.selectSpeed, isEqual)

export const useVoice_messageId = (): string => 
  useSelector(selectors.selectMessageId, isEqual)

export const useVoice_setMessageId = () => {
  const dispatch = useDispatch()
  return useCallback((id: string) => dispatch(voiceActions.setMessageId(id)), [dispatch])
}

export const useVoice_setCurrentSpeakerId = () => {
  const dispatch = useDispatch()
  return useCallback((id: string) => dispatch(voiceActions.setCurrentSpeakerId(id)), [dispatch])
}

export const useVoice_setPaused = () => {
  const dispatch = useDispatch()
  return useCallback((paused: boolean) => dispatch(voiceActions.setPaused(paused)), [dispatch])
}

export const useVoice_setCurrentlySpeaking = () => {
  const dispatch = useDispatch()
  return useCallback((text: string) => dispatch(voiceActions.setCurrentlySpeaking(text)), [dispatch])
}

export const useVoice_setSpeed = () => {
  const dispatch = useDispatch()
  return useCallback((speed: number) => dispatch(voiceActions.setSpeed(speed)), [dispatch])
}
