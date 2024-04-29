import { configureStore } from '@reduxjs/toolkit'
import { createLogger } from 'redux-logger'
import spacesReducer from './spaces/slice'
import personasReducer from './personas/slice'

const logger = createLogger({
  predicate: (_, action) => ![
    ''
  ].includes(action.type)
})

// @ts-ignore
const batchMiddleware = (_) => (next) => (actions) => {
  if (Array.isArray(actions)) {
    next({
      type: 'BATCHED_ACTIONS',
      payload: actions,
    })
    
    actions.forEach(action => next(action))
  } 
  else {
    return next(actions)
  }
}

export const store = configureStore({
  reducer: {
    spaces: spacesReducer,
    personas: personasReducer
  },
  middleware: getDefaultMiddleware => 
    // @ts-ignore
    getDefaultMiddleware()
      .concat(process.env.NODE_ENV === 'development' ? logger : [])
      .concat(batchMiddleware)
})

import * as spacesActions from './spaces/slice'
import * as personasActions from './personas/slice'

import { init } from './sync'

store.dispatch(spacesActions.fetchSpacesAsync())
store.dispatch(spacesActions.fetchGroupsAsync())
store.dispatch(spacesActions.fetchChannelsAsync())
store.dispatch(spacesActions.fetchThreadsAsync())
store.dispatch(spacesActions.fetchMessagesAsync())
store.dispatch(spacesActions.fetchUsersAsync())

store.dispatch(personasActions.fetchPersonasAsync())

init()

export type State = ReturnType<typeof store.getState>
