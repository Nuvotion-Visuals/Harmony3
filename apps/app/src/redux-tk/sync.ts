import { store } from './store'
import { pb } from './pocketbase'
import { spacesActions } from './spaces/slice'
import { personasActions } from './personas/slice'

export const init = () => {
  pb.collection('spaces').subscribe('*', (event) => {
    switch (event.action) {
      case 'create':
        store.dispatch(spacesActions.createSpace(event.record))
        break
      case 'update':
        store.dispatch(spacesActions.updateSpace(event.record))
        break
      case 'delete':
        store.dispatch(spacesActions.deleteSpace(event.record.id))
        break
      default:
        break
    }
  })

  pb.collection('groups').subscribe('*', (event) => {
    switch (event.action) {
      case 'create':
        store.dispatch(spacesActions.createGroup(event.record))
        break
      case 'update':
        store.dispatch(spacesActions.updateGroup(event.record))
        break
      case 'delete':
        store.dispatch(spacesActions.deleteGroup(event.record.id))
        break
      default:
        break
    }
  })

  pb.collection('channels').subscribe('*', (event) => {
    switch (event.action) {
      case 'create':
        store.dispatch(spacesActions.createChannel(event.record))
        break
      case 'update':
        store.dispatch(spacesActions.updateChannel(event.record))
        break
      case 'delete':
        store.dispatch(spacesActions.deleteChannel(event.record.id))
        break
      default:
        break
    }
  })

  pb.collection('threads').subscribe('*', (event) => {
    switch (event.action) {
      case 'create':
        store.dispatch(spacesActions.createThread(event.record))
        break
      case 'update':
        store.dispatch(spacesActions.updateThread(event.record))
        break
      case 'delete':
        store.dispatch(spacesActions.deleteThread(event.record.id))
        break
      default:
        break
    }
  })

  pb.collection('messages').subscribe('*', (event) => {
    if (event.record?.system) {
      return
    }

    switch (event.action) {
      case 'create':
        store.dispatch(spacesActions.createMessage(event.record))
        break
      case 'update':
        store.dispatch(spacesActions.updateMessage(event.record))
        break
      case 'delete':
        store.dispatch(spacesActions.deleteMessage(event.record.id))
        break
      default:
        break
    }
  })

  pb.collection('users').subscribe('*', (event) => {
    switch (event.action) {
      case 'create':
        store.dispatch(spacesActions.createUser(event.record))
        break
      case 'update':
        store.dispatch(spacesActions.updateUser(event.record))
        break
      case 'delete':
        store.dispatch(spacesActions.deleteUser(event.record.id))
        break
      default:
        break
    }
  })

  pb.collection('personas').subscribe('*', (event) => {
    switch (event.action) {
      case 'create':
        store.dispatch(personasActions.createPersona(event.record))
        break
      case 'update':
        store.dispatch(personasActions.updatePersona(event.record))
        break
      case 'delete':
        store.dispatch(personasActions.deletePersona(event.record.id))
        break
    }
  })
}
