import { configureStore } from '@reduxjs/toolkit'
import { createLogger } from 'redux-logger'
import harmonyReducer from './harmony/slice'

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
    harmony: harmonyReducer,
  },
  middleware: getDefaultMiddleware => 
    // @ts-ignore
    getDefaultMiddleware()
      .concat(process.env.NODE_ENV === 'development' ? logger : [])
      .concat(batchMiddleware)
})

import * as harmonyActions from './harmony/slice'
import { init } from './sync'

store.dispatch(harmonyActions.fetchSpacesAsync())
store.dispatch(harmonyActions.fetchGroupsAsync())
store.dispatch(harmonyActions.fetchChannelsAsync())
store.dispatch(harmonyActions.fetchThreadsAsync())
store.dispatch(harmonyActions.fetchMessagesAsync())

init()

export type State = ReturnType<typeof store.getState>
