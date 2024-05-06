import { State } from '../store'

export const selectCurrentSpeakerId = (state: State): string => 
  state.voice.currentSpeakerId

export const selectPlaying = (state: State): boolean => 
  state.voice.playing

export const selectPaused = (state: State): boolean => 
  state.voice.paused

export const selectCurrentlySpeaking = (state: State): string => 
  state.voice.currentlySpeaking

export const selectSpeed = (state: State): number => 
  state.voice.speed

export const selectMessageId = (state: State): string => 
  state.voice.messageId
