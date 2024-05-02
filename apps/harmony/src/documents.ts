import type {
  MessagesResponse,
  SpacesResponse,
  GroupsResponse,
  ChannelsResponse,
  ThreadsResponse
} from './pocketbase-types'
import { getPocketBaseClient } from './pocketbase'
import { Document } from 'llamaindex'

interface DataStructure {
  spaces: SpacesResponse[]
  groups: GroupsResponse[]
  channels: ChannelsResponse[]
  threads: ThreadsResponse[]
  messages: MessagesResponse[]
}

async function getStructureData(): Promise<DataStructure> {
  const pb = getPocketBaseClient()
  
  const spaces = await pb.collection('spaces').getFullList()
  const groups = await pb.collection('groups').getFullList()
  const channels = await pb.collection('channels').getFullList()
  const threads = await pb.collection('threads').getFullList()
  const messages = await pb.collection('messages').getFullList({
    filter: `system != true && threadid != null`,
    sort: 'created'
  })

  return {
    spaces,
    groups,
    channels,
    threads,
    messages
  }
}

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
            spacesData.spaces[space.id].groups[group.id].channels[channel.id].threads[thread.id].messages[message.id] = {
              id: message.id,
              text: message.text,
            } as MessagesResponse
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
    description: string
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

export async function createJSONDocumentStructure(): Promise<JSONDocument[]> {
  const dataStructure = await generateSpacesDataStructure() 
  const jsonDocuments: JSONDocument[] = []

  jsonDocuments.push(createSpacesDocument(dataStructure))

  for (const spaceId in dataStructure.spaces) {
    const space = dataStructure.spaces[spaceId]
    if (Object.keys(space.groups).length > 0) {
      jsonDocuments.push(createSpaceGroupsDocument(space))
    }
  }

  await fs.writeFile('documentStructure.json', JSON.stringify(jsonDocuments, null, 2), 'utf8')
  console.log('Document structure has been written to documentStructure.json')
  return jsonDocuments
}


export async function getDocuments(): Promise<Document[]> {
  const JSONDocuments = await createJSONDocumentStructure()

  console.log(JSONDocuments)

  return JSONDocuments.map(json => new Document(json))
}