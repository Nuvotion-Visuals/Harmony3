/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Channels = "channels",
	Groups = "groups",
	Messages = "messages",
	Spaces = "spaces",
	Threads = "threads",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type ChannelsRecord = {
	description?: HTMLString
	groupid?: RecordIdString
	name?: string
}

export type GroupsRecord = {
	description?: HTMLString
	name?: string
	spaceid?: RecordIdString
	userid?: RecordIdString
}

export type MessagesRecord = {
	text?: string
	threadid?: RecordIdString
	userid?: RecordIdString
}

export type SpacesRecord = {
	description?: HTMLString
	name?: string
	userid?: RecordIdString
}

export type ThreadsRecord = {
	channelid?: RecordIdString
	description?: HTMLString
	name?: string
	userid?: RecordIdString
}

export type UsersRecord = {
	avatar?: string
	name?: string
}

// Response types include system fields and match responses from the PocketBase API
export type ChannelsResponse<Texpand = unknown> = Required<ChannelsRecord> & BaseSystemFields<Texpand>
export type GroupsResponse<Texpand = unknown> = Required<GroupsRecord> & BaseSystemFields<Texpand>
export type MessagesResponse<Texpand = unknown> = Required<MessagesRecord> & BaseSystemFields<Texpand>
export type SpacesResponse<Texpand = unknown> = Required<SpacesRecord> & BaseSystemFields<Texpand>
export type ThreadsResponse<Texpand = unknown> = Required<ThreadsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	channels: ChannelsRecord
	groups: GroupsRecord
	messages: MessagesRecord
	spaces: SpacesRecord
	threads: ThreadsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	channels: ChannelsResponse
	groups: GroupsResponse
	messages: MessagesResponse
	spaces: SpacesResponse
	threads: ThreadsResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: 'channels'): RecordService<ChannelsResponse>
	collection(idOrName: 'groups'): RecordService<GroupsResponse>
	collection(idOrName: 'messages'): RecordService<MessagesResponse>
	collection(idOrName: 'spaces'): RecordService<SpacesResponse>
	collection(idOrName: 'threads'): RecordService<ThreadsResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
