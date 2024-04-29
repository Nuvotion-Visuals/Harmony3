import { CollectionResponses } from 'redux-tk/pocketbase-types'

import { State } from '../store'
export const selectActivePersonaId = (state: State): string | null => state.personas.activePersonaId
export const selectPersonas = (state: State): CollectionResponses['personas'][] => state.personas.personas
export const selectActivePersona = (state: State): CollectionResponses['personas'] | null => 
  state.personas.personas.find(persona => persona.id === state.personas.activePersonaId) || null
