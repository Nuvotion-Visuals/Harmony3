// voiceSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface VoiceState {
  currentSpeakerId: string
  speaking: boolean
  currentlySpeaking: string
  messageId: string
  speed: number
}

const INITIAL_STATE: VoiceState = {
  currentSpeakerId: '',
  speaking: false,
  currentlySpeaking: '',
  messageId: '',
  speed: 1
}

const voiceSlice = createSlice({
  name: 'voice',
  initialState: INITIAL_STATE,
  reducers: {
    setCurrentSpeakerId: (state, action: PayloadAction<string>) => {
      state.currentSpeakerId = action.payload
    },
    setSpeaking: (state, action: PayloadAction<boolean>) => {
      state.speaking = action.payload
    },
    setCurrentlySpeaking: (state, action: PayloadAction<string>) => {
      state.currentlySpeaking = action.payload
    },
    setMessageId: (state, action: PayloadAction<string>) => {
      state.messageId = action.payload
    },
    setSpeed: (state, action: PayloadAction<number>) => {
      state.speed = action.payload
    }
  }
})

export const voiceActions = voiceSlice.actions
export default voiceSlice.reducer
