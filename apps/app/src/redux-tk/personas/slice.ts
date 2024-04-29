// personasSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { CollectionRecords, CollectionResponses } from '../pocketbase-types'
import { pb } from 'redux-tk/pocketbase'
import { RecordModel } from 'pocketbase'

interface PersonasState {
  personas: CollectionResponses['personas'][]
  activePersonaId: string | null
}

const INITIAL_STATE: PersonasState = {
  personas: [],
  activePersonaId: null
}

export const fetchPersonasAsync = createAsyncThunk(
  'personas/fetchPersonas',
  async () => {
    const fetchedPersonas = await pb.collection('personas').getFullList()
    return fetchedPersonas as CollectionResponses['personas'][]
  }
)

const personasSlice = createSlice({
  name: 'personas',
  initialState: INITIAL_STATE,
  reducers: {
    setActivePersonaId: (state, action: PayloadAction<string | null>) => {
      state.activePersonaId = action.payload
    },
   
    setPersonas: (state, action: PayloadAction<CollectionResponses['personas'][]>) => {
      state.personas = action.payload
    },
    createPersona: (state, action: PayloadAction<CollectionRecords['personas']>) => {
      state.personas.push(action.payload as CollectionResponses['personas'])
    },
    updatePersona: (state, action: PayloadAction<RecordModel>) => {
      const index = state.personas.findIndex(persona => persona.id === action.payload.id)
      if (index !== -1) {
        state.personas[index] = action.payload as CollectionResponses['personas']
      }
    },
    deletePersona: (state, action: PayloadAction<string>) => {
      state.personas = state.personas.filter(persona => persona.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPersonasAsync.fulfilled, (state, action) => {
        state.personas = action.payload
      })
  }
})

export const personasActions = {
  ...personasSlice.actions,
  fetchPersonasAsync,
}

export default personasSlice.reducer
