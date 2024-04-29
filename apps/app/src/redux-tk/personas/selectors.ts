import { CollectionResponses } from 'redux-tk/pocketbase-types'

import { State } from '../store'
export const selectActivePersonaId = (state: State): string | null => state.personas.activePersonaId
export const selectPersonas = (state: State): CollectionResponses['personas'][] => state.personas.personas
export const selectActivePersona = (state: State): CollectionResponses['personas'] | null => 
  state.personas.personas.find(persona => persona.id === state.personas.activePersonaId) || null

export const selectPersonasInfoById = (state: State): Record<string, { name: string, provider: string, model: string, avatar: string, id: string }> => {
  return state.personas.personas.reduce((info, persona) => {
    info[persona.id] = {
      name: persona.name,
      provider: persona.provider,
      model: persona.model,
      avatar: persona.avatar,
      id: persona.id
    }
    return info
  }, {} as Record<string, { name: string, provider: string, model: string, avatar: string, id: string }>)
}