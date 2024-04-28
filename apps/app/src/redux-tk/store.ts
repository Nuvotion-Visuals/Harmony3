import { configureStore } from '@reduxjs/toolkit'
import { createLogger } from 'redux-logger'
import spacesReducer from './spaces/slice'

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
  },
  middleware: getDefaultMiddleware => 
    // @ts-ignore
    getDefaultMiddleware()
      .concat(process.env.NODE_ENV === 'development' ? logger : [])
      .concat(batchMiddleware)
})

import * as spacesAction from './spaces/slice'
import { init } from './sync'

store.dispatch(spacesAction.fetchSpacesAsync())
store.dispatch(spacesAction.fetchGroupsAsync())
store.dispatch(spacesAction.fetchChannelsAsync())
store.dispatch(spacesAction.fetchThreadsAsync())
store.dispatch(spacesAction.fetchMessagesAsync())
store.dispatch(spacesAction.fetchUsersAsync())

init()

export type State = ReturnType<typeof store.getState>
