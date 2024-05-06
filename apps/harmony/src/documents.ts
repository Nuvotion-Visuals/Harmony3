import type {
  MessagesResponse,
  SpacesResponse,
  GroupsResponse,
  ChannelsResponse,
  ThreadsResponse
} from './pocketbase-types'
import { getPocketBaseClient } from './pocketbase'
import { Document } from 'llamaindex'

interface SpacesDataStructure {
  spaces: {
    [id: string]: SpacesResponse & {
      groups: {
        [id: string]: GroupsResponse & {
          channels: {
            [id: string]: ChannelsResponse & {
              threads: {
                [id: string]: ThreadsResponse & {
                  messages: {
                    [id: string]: MessagesResponse
                  }
                }
              }
            }
          }
        }
      }
    }
  },
}

// Initialize the data structure from the database
async function generateSpacesDataStructure(): Promise<SpacesDataStructure> {
  const pb = getPocketBaseClient()
  
  const spacesData: SpacesDataStructure = { spaces: {} }

  const spaces = await pb.collection('spaces').getFullList()
  for (const space of spaces) {
    spacesData.spaces[space.id] = {
      id: space.id,
      name: space.name,
      description: space.description,
      groups: {}
    } as SpacesResponse & { groups: Record<string, GroupsResponse & { channels: Record<string, ChannelsResponse & { threads: Record<string, ThreadsResponse & { messages: Record<string, MessagesResponse> }> }> }> }

    const groups = await pb.collection('groups').getFullList({ filter: `spaceid='${space.id}'` })
    for (const group of groups) {
      spacesData.spaces[space.id].groups[group.id] = {
        id: group.id,
        name: group.name,
        description: group.description,
        channels: {}
      } as GroupsResponse & { channels: Record<string, ChannelsResponse & { threads: Record<string, ThreadsResponse & { messages: Record<string, MessagesResponse> }> }> }

      const channels = await pb.collection('channels').getFullList({ filter: `groupid='${group.id}'` })
      for (const channel of channels) {
        spacesData.spaces[space.id].groups[group.id].channels[channel.id] = {
          id: channel.id,
          name: channel.name,
          description: channel.description,
          threads: {}
        } as ChannelsResponse & { threads: Record<string, ThreadsResponse & { messages: Record<string, MessagesResponse> }> }

        const threads = await pb.collection('threads').getFullList({ filter: `channelid='${channel.id}'` })
        for (const thread of threads) {
          spacesData.spaces[space.id].groups[group.id].channels[channel.id].threads[thread.id] = {
            id: thread.id,
            name: thread.name,
            description: thread.description,
            messages: {}
          } as ThreadsResponse & { messages: Record<string, MessagesResponse> }

          const messages = await pb.collection('messages').getFullList({ filter: `threadid='${thread.id}'` })
          for (const message of messages) {
            if (!message?.system) {
              spacesData.spaces[space.id].groups[group.id].channels[channel.id].threads[thread.id].messages[message.id] = {
                id: message.id,
                text: message.text,
              } as MessagesResponse
            }
          }
        }
      }
    }
  }

  return spacesData
}

import { promises as fs } from 'fs'

interface JSONDocument {
  text: string
  metadata: {
    name: string
    description?: string
  }
  id_: string
}

const createSpacesDocument = (dataStructure: SpacesDataStructure): JSONDocument => {
  const metadata = {
    name: 'Spaces',
    description: 'Spaces are the broadest organizational unit of the platform. They consist of Groups, Channels, Threads, and Messages.'
  }

  const spaces = Object.values(dataStructure.spaces).map(space => ({
    name: space.name,
    description: space.description
  }))

  return {
    text: JSON.stringify(`${JSON.stringify(metadata)} ${JSON.stringify(spaces)}`),
    id_: 'spaces',
    metadata
  }
}
const createSpaceGroupsDocument = (space: SpacesDataStructure['spaces'][keyof SpacesDataStructure['spaces']]): JSONDocument => {
  const metadata = {
    name: `Groups in ${space.name} Space`,
    description: `The groups available for space ${space.name}, each with name and description.`
  }

  const groups = Object.values(space.groups).map(group => ({
    name: group.name,
    description: group.description
  }))

  return {
    text: JSON.stringify(`${JSON.stringify(metadata)} ${JSON.stringify(groups)}`),
    id_: `groups_in_${space.name.replace(/\s+/g, '_')}`,
    metadata
  }
}

export const createGroupChannels = (spaceName: string, group: SpacesDataStructure['spaces'][keyof SpacesDataStructure['spaces']]['groups'][keyof SpacesDataStructure['spaces'][keyof SpacesDataStructure['spaces']]['groups']]): JSONDocument => {
  const metadata = {
    name: `Channels in ${group.name} Group of ${spaceName} Space`,
  }

  const channels = Object.values(group.channels).map(channel => ({
    name: channel.name,
    description: channel.description
  }))

  return {
    text: JSON.stringify(`${JSON.stringify(metadata)} ${JSON.stringify(channels)}`),
    id_: `channels_in_${group.name.replace(/\s+/g, '_')}_of_${spaceName.replace(/\s+/g, '_')}`,
    metadata
  }
}

export const createChannelThreads = (spaceName: string, groupName: string, channel: SpacesDataStructure['spaces'][keyof SpacesDataStructure['spaces']]['groups'][keyof SpacesDataStructure['spaces'][keyof SpacesDataStructure['spaces']]['groups']]['channels'][keyof SpacesDataStructure['spaces'][keyof SpacesDataStructure['spaces']]['groups'][keyof SpacesDataStructure['spaces'][keyof SpacesDataStructure['spaces']]['groups']]['channels']]): JSONDocument | null => {
  if (Object.keys(channel.threads).length > 0) {
    const metadata = {
      name: `Threads in ${channel.name} Channel of ${groupName} Group in ${spaceName} Space`,
      description: `Threads listed under the channel ${channel.name} of the group ${groupName} in the space ${spaceName}`
    }

    const threads = Object.values(channel.threads).map(thread => ({
      name: thread.name
    }))

    return {
      text: JSON.stringify(`${JSON.stringify(metadata)} ${JSON.stringify(threads)}`),
      id_: `threads_in_${channel.name.replace(/\s+/g, '_')}_of_${groupName.replace(/\s+/g, '_')}_in_${spaceName.replace(/\s+/g, '_')}`,
      metadata
    }
  }
  return null
}

export const createThreadMessages = (
  spaceName: string, 
  groupName: string, 
  channelName: string, 
  thread: SpacesDataStructure['spaces'][keyof SpacesDataStructure['spaces']]['groups'][keyof SpacesDataStructure['spaces'][keyof SpacesDataStructure['spaces']]['groups']]['channels'][keyof SpacesDataStructure['spaces'][keyof SpacesDataStructure['spaces']]['groups'][keyof SpacesDataStructure['spaces'][keyof SpacesDataStructure['spaces']]['groups']]['channels']]['threads'][keyof SpacesDataStructure['spaces'][keyof SpacesDataStructure['spaces']]['groups'][keyof SpacesDataStructure['spaces'][keyof SpacesDataStructure['spaces']]['groups']]['channels'][keyof SpacesDataStructure['spaces'][keyof SpacesDataStructure['spaces']]['groups'][keyof SpacesDataStructure['spaces'][keyof SpacesDataStructure['spaces']]['groups']]['channels']]['threads']]
): JSONDocument | null => {
  if (Object.keys(thread.messages).length > 0) {
    const metadata = {
      name: `Messages in ${thread.name} Thread of ${channelName} Channel in ${groupName} Group of ${spaceName} Space`,
      description: thread.description
    }

    const messages = Object.values(thread.messages).map(message => ({
      text: message.text
    }))

    return {
      text: JSON.stringify(`${JSON.stringify(metadata)} ${JSON.stringify(messages)}`),
      id_: `messages_in_${thread.name.replace(/\s+/g, '_')}_of_${channelName.replace(/\s+/g, '_')}_in_${groupName.replace(/\s+/g, '_')}_in_${spaceName.replace(/\s+/g, '_')}`,
      metadata
    }
  }
  return null
}

export async function createJSONDocumentStructure(): Promise<JSONDocument[]> {
  const dataStructure = await generateSpacesDataStructure()
  const jsonDocuments: JSONDocument[] = []

  jsonDocuments.push(createSpacesDocument(dataStructure))

  for (const spaceId in dataStructure.spaces) {
    const space = dataStructure.spaces[spaceId]
    for (const groupId in space.groups) {
      const group = space.groups[groupId]
      jsonDocuments.push(createGroupChannels(space.name, group)) // Ensure this call remains
      for (const channelId in group.channels) {
        const channel = group.channels[channelId]
        const channelThreadsDocument = createChannelThreads(space.name, group.name, channel)
        if (channelThreadsDocument !== null) {
          jsonDocuments.push(channelThreadsDocument)
        }
        for (const threadId in channel.threads) {
          const thread = channel.threads[threadId]
          const threadMessagesDocument = createThreadMessages(space.name, group.name, channel.name, thread)
          if (threadMessagesDocument !== null) {
            jsonDocuments.push(threadMessagesDocument)
          }
        }
      }
    }
  }

  await fs.writeFile('documentStructure.json', JSON.stringify(jsonDocuments, null, 2), 'utf8')
  return jsonDocuments
}

export async function getDocuments(): Promise<Document[]> {
  const JSONDocuments = await createJSONDocumentStructure()
  return JSONDocuments.map(json => new Document(json))
}