// harmonySlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { CollectionRecords, CollectionResponses, UsersResponse } from '../pocketbase-types'
import { pb } from 'redux-tk/pocketbase'
import { RecordModel } from 'pocketbase'

interface HarmonyState {
  users: CollectionResponses['users'][]
  spaces: CollectionResponses['spaces'][]
  groups: CollectionResponses['groups'][]
  threads: CollectionResponses['threads'][]
  channels: CollectionResponses['channels'][]
  messages: CollectionResponses['messages'][]
  activeSpaceId: string | null
  activeSpaceIndex: number | null
  activeGroupId: string | null
  activeThreadId: string | null
  activeChannelId: string | null
  activeMessageId: string | null
  currentUser: UsersResponse | null
}

const INITIAL_STATE: HarmonyState = {
  users: [],
  spaces: [],
  groups: [],
  threads: [],
  channels: [],
  messages: [],
  activeSpaceId: null,
  activeGroupId: null,
  activeChannelId: null,
  activeThreadId: null,
  activeMessageId: null,
  activeSpaceIndex: null,
  currentUser: null,
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

export const fetchChannelsAsync = createAsyncThunk(
  'harmony/fetchChannels',
  async () => {
    const fetchedChannels = await pb.collection('channels').getFullList()
    return fetchedChannels as CollectionResponses['channels'][]
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

export const fetchUsersAsync = createAsyncThunk(
  'harmony/fetchUsers',
  async () => {
    const fetchedUsers = await pb.collection('users').getFullList()
    return fetchedUsers as CollectionResponses['users'][]
  }
)

const harmonySlice = createSlice({
  name: 'harmony',
  initialState: INITIAL_STATE,
  reducers: {
    setActiveSpaceIndex: (state, action: PayloadAction<number | null>) => {
      state.activeSpaceIndex = action.payload
    },
    setActiveSpaceId: (state, action: PayloadAction<string | null>) => {
      state.activeSpaceId = action.payload
      if (action.payload === null) {
        state.activeSpaceIndex = null
      } 
      else {
        const index = state.spaces.findIndex(space => space.id === action.payload)
        state.activeSpaceIndex = index !== -1 ? index : 0
      }
    },
   
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

    setActiveGroupId: (state, action: PayloadAction<string | null>) => {
      state.activeGroupId = action.payload
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

    setActiveChannelId: (state, action: PayloadAction<string | null>) => {
      state.activeChannelId = action.payload;
    },
    setChannels: (state, action: PayloadAction<CollectionResponses['channels'][]>) => {
      state.channels = action.payload;
    },
    createChannel: (state, action: PayloadAction<CollectionRecords['channels']>) => {
      state.channels.push(action.payload as CollectionResponses['channels']);
    },
    updateChannel: (state, action: PayloadAction<RecordModel>) => {
      const index = state.channels.findIndex(channel => channel.id === action.payload.id);
      if (index !== -1) {
        state.channels[index] = action.payload as CollectionResponses['channels'];
      }
    },
    deleteChannel: (state, action: PayloadAction<string>) => {
      state.channels = state.channels.filter(channel => channel.id !== action.payload);
    },

    setActiveThreadId: (state, action: PayloadAction<string | null>) => {
      state.activeThreadId = action.payload
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
    
    setActiveMessageId: (state, action: PayloadAction<string | null>) => {
      state.activeMessageId = action.payload
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

    setUsers: (state, action: PayloadAction<CollectionResponses['users'][]>) => {
      state.users = action.payload
    },
    createUser: (state, action: PayloadAction<CollectionRecords['users']>) => {
      state.users.push(action.payload as CollectionResponses['users'])
    },
    updateUser: (state, action: PayloadAction<RecordModel>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload as CollectionResponses['users']
      }
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.id !== action.payload)
    },

    setCurrentUser: (state, action: PayloadAction<UsersResponse | null>) => {
      state.currentUser = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpacesAsync.fulfilled, (state, action) => {
        state.spaces = action.payload
      })
      .addCase(fetchGroupsAsync.fulfilled, (state, action) => {
        state.groups = action.payload
      })
      .addCase(fetchChannelsAsync.fulfilled, (state, action) => {
        state.channels = action.payload
      })
      .addCase(fetchThreadsAsync.fulfilled, (state, action) => {
        state.threads = action.payload
      })
      .addCase(fetchMessagesAsync.fulfilled, (state, action) => {
        state.messages = action.payload
      })
      .addCase(fetchUsersAsync.fulfilled, (state, action) => {
        state.users = action.payload
      })
  }
})

export const harmonyActions = {
  ...harmonySlice.actions,
  fetchSpacesAsync,
  fetchGroupsAsync,
  fetchChannelsAsync,
  fetchThreadsAsync,
  fetchMessagesAsync,
  fetchUsersAsync
}

export default harmonySlice.reducer
