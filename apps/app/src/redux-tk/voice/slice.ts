import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface VoiceState {
  currentSpeakerId: string
  paused: boolean
  currentlySpeaking: string
  messageId: string
  speed: number
}

const INITIAL_STATE: VoiceState = {
  currentSpeakerId: '',
  paused: false,
  currentlySpeaking: '',
  messageId: '',
  speed: Number(localStorage.getItem('voice_speed')) || 1
}

const voiceSlice = createSlice({
  name: 'voice',
  initialState: INITIAL_STATE,
  reducers: {
    setCurrentSpeakerId: (state, action: PayloadAction<string>) => {
      state.currentSpeakerId = action.payload
    },
    setPaused: (state, action: PayloadAction<boolean>) => {
      state.paused = action.payload
    },
    setCurrentlySpeaking: (state, action: PayloadAction<string>) => {
      state.currentlySpeaking = action.payload
    },
    setMessageId: (state, action: PayloadAction<string>) => {
      state.messageId = action.payload
    },
    setSpeed: (state, action: PayloadAction<number>) => {
      state.speed = action.payload
      localStorage.setItem('voice_speed', String(action.payload))
    }
  }
})

export const voiceActions = voiceSlice.actions
export default voiceSlice.reducer
