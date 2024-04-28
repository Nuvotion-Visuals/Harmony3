import { store } from './store'
import { pb } from './pocketbase'
import { spacesAction } from './spaces/slice'

export const init = () => {
  pb.collection('spaces').subscribe('*', (event) => {
    switch (event.action) {
      case 'create':
        store.dispatch(spacesAction.createSpace(event.record))
        break
      case 'update':
        store.dispatch(spacesAction.updateSpace(event.record))
        break
      case 'delete':
        store.dispatch(spacesAction.deleteSpace(event.record.id))
        break
      default:
        break
    }
  })

  pb.collection('groups').subscribe('*', (event) => {
    switch (event.action) {
      case 'create':
        store.dispatch(spacesAction.createGroup(event.record))
        break
      case 'update':
        store.dispatch(spacesAction.updateGroup(event.record))
        break
      case 'delete':
        store.dispatch(spacesAction.deleteGroup(event.record.id))
        break
      default:
        break
    }
  })

  pb.collection('channels').subscribe('*', (event) => {
    switch (event.action) {
      case 'create':
        store.dispatch(spacesAction.createChannel(event.record))
        break
      case 'update':
        store.dispatch(spacesAction.updateChannel(event.record))
        break
      case 'delete':
        store.dispatch(spacesAction.deleteChannel(event.record.id))
        break
      default:
        break
    }
  })

  pb.collection('threads').subscribe('*', (event) => {
    switch (event.action) {
      case 'create':
        store.dispatch(spacesAction.createThread(event.record))
        break
      case 'update':
        store.dispatch(spacesAction.updateThread(event.record))
        break
      case 'delete':
        store.dispatch(spacesAction.deleteThread(event.record.id))
        break
      default:
        break
    }
  })

  pb.collection('messages').subscribe('*', (event) => {
    switch (event.action) {
      case 'create':
        store.dispatch(spacesAction.createMessage(event.record))
        break
      case 'update':
        store.dispatch(spacesAction.updateMessage(event.record))
        break
      case 'delete':
        store.dispatch(spacesAction.deleteMessage(event.record.id))
        break
      default:
        break
    }
  })

  pb.collection('users').subscribe('*', (event) => {
    switch (event.action) {
      case 'create':
        store.dispatch(spacesAction.createUser(event.record))
        break
      case 'update':
        store.dispatch(spacesAction.updateUser(event.record))
        break
      case 'delete':
        store.dispatch(spacesAction.deleteUser(event.record.id))
        break
      default:
        break
    }
  })
}
