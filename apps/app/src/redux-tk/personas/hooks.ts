import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import { personasActions } from './slice'
import * as selectors from './selectors'
import { CollectionResponses } from 'redux-tk/pocketbase-types'
import { isEqual } from 'lodash'

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
