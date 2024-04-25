import { store } from './store'
import { pb } from './pocketbase'
import { harmonyActions } from './harmony/slice'

export const init = () => {
  pb.collection('spaces').subscribe('*', (event) => {
    switch (event.action) {
      case 'create':
        store.dispatch(harmonyActions.createSpace(event.record))
        break
      case 'update':
        store.dispatch(harmonyActions.updateSpace(event.record))
        break
      case 'delete':
        store.dispatch(harmonyActions.deleteSpace(event.record.id))
        break
      default:
        break
    }
  })

  pb.collection('groups').subscribe('*', (event) => {
    switch (event.action) {
      case 'create':
        store.dispatch(harmonyActions.createGroup(event.record))
        break
      case 'update':
        store.dispatch(harmonyActions.updateGroup(event.record))
        break
      case 'delete':
        store.dispatch(harmonyActions.deleteGroup(event.record.id))
        break
      default:
        break
    }
  })

  pb.collection('channels').subscribe('*', (event) => {
    switch (event.action) {
      case 'create':
        store.dispatch(harmonyActions.createChannel(event.record))
        break
      case 'update':
        store.dispatch(harmonyActions.updateChannel(event.record))
        break
      case 'delete':
        store.dispatch(harmonyActions.deleteChannel(event.record.id))
        break
      default:
        break
    }
  })

  pb.collection('threads').subscribe('*', (event) => {
    switch (event.action) {
      case 'create':
        store.dispatch(harmonyActions.createThread(event.record))
        break
      case 'update':
        store.dispatch(harmonyActions.updateThread(event.record))
        break
      case 'delete':
        store.dispatch(harmonyActions.deleteThread(event.record.id))
        break
      default:
        break
    }
  })

  pb.collection('messages').subscribe('*', (event) => {
    switch (event.action) {
      case 'create':
        store.dispatch(harmonyActions.createMessage(event.record))
        break
      case 'update':
        store.dispatch(harmonyActions.updateMessage(event.record))
        break
      case 'delete':
        store.dispatch(harmonyActions.deleteMessage(event.record.id))
        break
      default:
        break
    }
  })
}
