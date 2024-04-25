// harmonySlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { CollectionRecords, CollectionResponses } from '../pocketbase-types'
import { pb } from 'redux-tk/pocketbase'
import { RecordModel } from 'pocketbase'

interface HarmonyState {
  spaces: CollectionResponses['spaces'][]
  groups: CollectionResponses['groups'][]
  threads: CollectionResponses['threads'][]
  messages: CollectionResponses['messages'][]
}

const INITIAL_STATE: HarmonyState = {
  spaces: [],
  groups: [],
  threads: [],
  messages: []
}

export const fetchSpacesAsync = createAsyncThunk(
  'harmony/fetchSpaces',
  async () => {
    const fetchedSpaces = await pb.collection('spaces').getFullList()
    return fetchedSpaces as CollectionResponses['spaces'][]
  }
)

export const fetchGroupsAsync = createAsyncThunk(
  'harmony/fetchGroups',
  async () => {
    const fetchedGroups = await pb.collection('groups').getFullList()
    return fetchedGroups as CollectionResponses['groups'][]
  }
)

export const fetchThreadsAsync = createAsyncThunk(
  'harmony/fetchThreads',
  async () => {
    const fetchedThreads = await pb.collection('threads').getFullList()
    return fetchedThreads as CollectionResponses['threads'][]
  }
)

export const fetchMessagesAsync = createAsyncThunk(
  'harmony/fetchMessages',
  async () => {
    const fetchedMessages = await pb.collection('messages').getFullList()
    return fetchedMessages as CollectionResponses['messages'][]
  }
)

const harmonySlice = createSlice({
  name: 'harmony',
  initialState: INITIAL_STATE,
  reducers: {
    setSpaces: (state, action: PayloadAction<CollectionResponses['spaces'][]>) => {
      state.spaces = action.payload
    },
    createSpace: (state, action: PayloadAction<CollectionRecords['spaces']>) => {
      state.spaces.push(action.payload as CollectionResponses['spaces'])
    },
    updateSpace: (state, action: PayloadAction<RecordModel>) => {
      const index = state.spaces.findIndex(space => space.id === action.payload.id);
      if (index !== -1) {
        state.spaces[index] = action.payload as CollectionResponses['spaces'];
      }
    },
    deleteSpace: (state, action: PayloadAction<string>) => {
      state.spaces = state.spaces.filter(space => space.id !== action.payload)
    },

    setGroups: (state, action: PayloadAction<CollectionResponses['groups'][]>) => {
      state.groups = action.payload
    },
    createGroup: (state, action: PayloadAction<CollectionRecords['groups']>) => {
      state.groups.push(action.payload as CollectionResponses['groups'])
    },
    updateGroup: (state, action: PayloadAction<RecordModel>) => {
      const index = state.groups.findIndex(group => group.id === action.payload.id);
      if (index !== -1) {
        state.groups[index] = action.payload as CollectionResponses['groups'];
      }
    },
    deleteGroup: (state, action: PayloadAction<string>) => {
      state.groups = state.groups.filter(group => group.id !== action.payload)
    },

    setThreads: (state, action: PayloadAction<CollectionResponses['threads'][]>) => {
      state.threads = action.payload
    },
    createThread: (state, action: PayloadAction<CollectionRecords['threads']>) => {
      state.threads.push(action.payload as CollectionResponses['threads'])
    },
    updateThread: (state, action: PayloadAction<RecordModel>) => {
      const index = state.threads.findIndex(thread => thread.id === action.payload.id);
      if (index !== -1) {
        state.threads[index] = action.payload as CollectionResponses['threads'];
      }
    },
    deleteThread: (state, action: PayloadAction<string>) => {
      state.threads = state.threads.filter(thread => thread.id !== action.payload)
    },
    
    setMessages: (state, action: PayloadAction<CollectionResponses['messages'][]>) => {
      state.messages = action.payload
    },
    createMessage: (state, action: PayloadAction<CollectionRecords['messages']>) => {
      state.messages.push(action.payload as CollectionResponses['messages'])
    },
    updateMessage: (state, action: PayloadAction<RecordModel>) => {
      const index = state.messages.findIndex(message => message.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = action.payload as CollectionResponses['messages'];
      }
    },
    deleteMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(message => message.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpacesAsync.fulfilled, (state, action) => {
        state.spaces = action.payload
      })
      .addCase(fetchGroupsAsync.fulfilled, (state, action) => {
        state.groups = action.payload
      })
      .addCase(fetchThreadsAsync.fulfilled, (state, action) => {
        state.threads = action.payload
      })
      .addCase(fetchMessagesAsync.fulfilled, (state, action) => {
        state.messages = action.payload
      })
  }
})

export const harmonyActions = {
  ...harmonySlice.actions,
  fetchSpacesAsync,
  fetchGroupsAsync,
  fetchThreadsAsync,
  fetchMessagesAsync,
}

export default harmonySlice.reducer
