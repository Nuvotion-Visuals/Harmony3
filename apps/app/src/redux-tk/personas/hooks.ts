import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useMemo } from 'react'
import { personasActions } from './slice'
import * as selectors from './selectors'
import { CollectionResponses } from 'redux-tk/pocketbase-types'
import { isEqual } from 'lodash'
import { State } from 'redux-tk/store'

export const usePersonas_activePersonaId = (): string | null => 
  useSelector(selectors.selectActivePersonaId, isEqual)

export const usePersonas_personas = (): CollectionResponses['personas'][] => 
  useSelector(selectors.selectPersonas, isEqual)

export const usePersonas_activePersona = (): CollectionResponses['personas'] | null => 
  useSelector(selectors.selectActivePersona, isEqual)

export const usePersonas_setActivePersonaId = () => {
  const dispatch = useDispatch()
  return useCallback((payload: string | null) => dispatch(personasActions.setActivePersonaId(payload)), [dispatch])
}

export const usePersonas_personaInfoById = (id: string): { name: string, provider: string, model: string, avatar: string, id: string } | undefined => {
  const memoizedSelector = useMemo(() => {
    return (state: State) => {
      const personasInfo = selectors.selectPersonasInfoById(state)
      return personasInfo[id] || undefined
    }
  }, [id])

  return useSelector(memoizedSelector, isEqual)
}