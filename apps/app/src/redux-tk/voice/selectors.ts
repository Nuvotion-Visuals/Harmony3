import { State } from '../store'

export const selectCurrentSpeakerId = (state: State): string => 
  state.voice.currentSpeakerId

export const selectSpeaking = (state: State): boolean => 
  state.voice.speaking

export const selectCurrentlySpeaking = (state: State): string => 
  state.voice.currentlySpeaking

export const selectSpeed = (state: State): number => 
  state.voice.speed

export const selectMessageId = (state: State): string => 
  state.voice.messageId
