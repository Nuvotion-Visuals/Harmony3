import { app as electron } from 'electron'
import { spawn } from 'child_process'
import path from 'path'
import { streamChatResponse } from './streamChatResponse'
import { JsonValidator } from './JsonValidator'
import { CollectionResponses, MessagesResponse, TypedPocketBase, UsersResponse } from './pocketbase-types'

let pb: any = null
let systemId: string | null = null
export const getPocketBaseClient = () => pb
export const getSystemId = () => systemId

// Pocketbase Client
const initPocketBaseClient = async () => {
  const PocketBase = require('pocketbase/cjs')
  pb = new PocketBase('http://127.0.0.1:8090')
  pb.autoCancellation(false)

  console.log('pocketbase started')

  try {
    await pb.collection('users').authWithPassword(
      'harmony',
      'qxIrfPYwKsMxZBQ'
    )
    systemId = pb.authStore.model?.id

     // Handle deletions for spaces
    pb.collection('spaces').subscribe('*', async (event: any) => {
      if (event.action === 'delete') {
        const spaceId = event.record.id
        console.log(`Space ${spaceId} deleted`)

        const groups = await pb.collection('groups').getFullList({ filter: 'spaceid=null' })
        for (const group of groups) {
          await pb.collection('groups').delete(group.id)
        }

        const channels = await pb.collection('channels').getFullList({ filter: 'spaceid=null' })
        for (const channel of channels) {
          await pb.collection('channels').delete(channel.id)
        }

        const threads = await pb.collection('threads').getFullList({ filter: 'spaceid=null' })
        for (const thread of threads) {
          await pb.collection('threads').delete(thread.id)
        }

        const messages = await pb.collection('messages').getFullList({ filter: 'spaceid=null' })
        for (const message of messages) {
          await pb.collection('messages').delete(message.id)
        }
      }
    })

    // Handle deletions for groups
    pb.collection('groups').subscribe('*', async (event: any) => {
      if (event.action === 'delete') {
        const groupId = event.record.id
        console.log(`Group ${groupId} deleted`)

        const channels = await pb.collection('channels').getFullList({ filter: 'groupid=null' })
        for (const channel of channels) {
          await pb.collection('channels').delete(channel.id)
        }

        const threads = await pb.collection('threads').getFullList({ filter: 'groupid=null' })
        for (const thread of threads) {
          await pb.collection('threads').delete(thread.id)
        }

        const messages = await pb.collection('messages').getFullList({ filter: 'groupid=null' })
        for (const message of messages) {
          await pb.collection('messages').delete(message.id)
        }
      }
    })

    // Handle deletions for channels
    pb.collection('channels').subscribe('*', async (event: any) => {
      if (event.action === 'delete') {
        const channelId = event.record.id
        console.log(`Channel ${channelId} deleted`)

        const threads = await pb.collection('threads').getFullList({ filter: 'channelid=null' })
        for (const thread of threads) {
          await pb.collection('threads').delete(thread.id)
        }

        const messages = await pb.collection('messages').getFullList({ filter: 'channelid=null' })
        for (const message of messages) {
          await pb.collection('messages').delete(message.id)
        }
      }
    })

    // Handle deletions for threads
    pb.collection('threads').subscribe('*', async (event: any) => {
      if (event.action === 'delete') {
        const threadId = event.record.id
        console.log(`Thread ${threadId} deleted`)

        const messages = await pb.collection('messages').getFullList({ filter: 'threadid=null' })
        for (const message of messages) {
          await pb.collection('messages').delete(message.id)
        }
      }
    })

    pb.collection('messages').subscribe('*', async (event: any) => {
      if (event.action === 'create' && event.record.userid !== systemId) {
        let messages
        const threadId = event.record.threadid
        let isFirstAssistantMessage = true
        let keys: any = null
        let sender: UsersResponse | null = null

        try {
          sender = await pb.collection('users').getOne(event.record.userid)
          if (sender) {
            keys = sender.keys
          }

          messages = await pb.collection('messages').getFullList({
            filter: `threadid="${threadId}"`,
            sort: 'created'
          })

          // Check if this is the first assistant message in the thread
          isFirstAssistantMessage = messages.every((message: MessagesResponse) => message.userid !== systemId)
        }
        catch (e) {
          console.error(e)
        }

        const personaId = messages?.[messages.length - 1].personaid
        let persona: CollectionResponses['personas']  | null = null
        if (personaId) {
          persona = await pb.collection('personas').getOne(personaId)
          const record = await pb.collection('messages').create({
            text: `Your name is ${persona?.name}. You MUST answer in character, not revelaing your nature is an LLM. System message: ${persona?.systemmessage}`, 
            system: true,
            userid: systemId, 
            threadid: threadId,
            personaid: personaId
          })
          messages = [...messages, record]
        }

        let llmMessages = [
          ...messages.map((message: any) => ({
            role: message.userid !== systemId 
              ? 'user' 
              : message?.system
                ? 'system'
                : 'assistant',
            content: message.text
          })),
          { 
            role: 'system', 
            content: `
              You are responding to ${sender?.name} 
              The user's bio is: ${sender?.bio}
              The user's preferences: ${sender?.preferences}
              You don't need to adknowledge these details in your response unless it's actually relevant to the query.
            ` 
          },
        ]

        console.log('Replying to message')
        const assistantMessage = await pb.collection('messages').create({
          text: '', 
          userid: systemId, 
          threadid: threadId,
          personaid: personaId,
          assistant: true
        })

        streamChatResponse({
          provider: persona?.provider || 'groq',
          model: persona?.model || 'llama3-70b-8192',
          index: true,
          keys,
          messages: llmMessages,
          callback: async (data) => {
            if (data.endOfStream) {
              await pb.collection('messages').update(assistantMessage.id, {
                text: data.message.content
              })
        
              if (isFirstAssistantMessage) {
                console.log('Complete response and first assistant message in thread')
        
                const newMessages = await pb.collection('messages').getFullList({
                  filter: `threadid="${threadId}"`,
                  sort: 'created'
                })
        
                let updatedLlmMessages = newMessages.map((message: any) => ({
                  role: message.userid !== systemId ? 'user' : 'assistant',
                  content: message.text
                }))
        
                const validator = new JsonValidator()
                streamChatResponse({
                  provider: persona?.provider || 'groq',
                  model: persona?.model || 'llama3-70b-8192',
                  index: true,
                  keys,
                  messages: [{
                      role: 'system',
                      content: `You are an API endpoint that provides a name and description for message thread based on a prompt, which is a series of messages. The description should be a very short sentence, no more than just a few words. The name starts with an emoji. You answer in the following JSON format. {
                        "name": "Social media strategies",
                        "description": "Craft a successful social media strategy to build your brand's online presence and drive engagement."
                      } If user feedback is provided it must be prioritized.
                      
                      Answer in as a valid JSON object, no extra commentary, only the object.`
                    }, 
                    {
                      role: 'user',
                      content: JSON.stringify(updatedLlmMessages)
                    }
                  ],
                  callback: async (data) => {
                    const name = validator.parseJsonProperty(data.message.content, 'name')
                    const description = validator.parseJsonProperty(data.message.content, 'description')
        
                    if (name || description) {
                      await pb.collection('threads').update(threadId, {
                        name,
                        description: description ? description : ''
                      })
                    }
                  }
                })
              }
            } 
            else {
              await pb.collection('messages').update(assistantMessage.id, {
                text: data.message.content
              })
            }
          }
        })
      }
    })
  }
  catch (e) {
    console.error(e)
  }
}

export const initPocketBase = () => {
  let basePath = electron.getAppPath()
  if (process.env.NODE_ENV === 'production') {
    basePath = path.join(process.resourcesPath)
  }

  const pocketbasePath = path.join(basePath, 'pocketbase', 'pocketbase.exe')
  const pocketbaseProcess = spawn(pocketbasePath, ['serve', '--http=0.0.0.0:8090'])

  pocketbaseProcess.stdout.on('data', data => {
    const output = data.toString()
    if (output.includes('Server started')) {
      initPocketBaseClient()
    }
  })

  pocketbaseProcess.stderr.on('data', data => {
    console.error('PocketBase Error:', data.toString())
  })

  pocketbaseProcess.on('exit', code => {
    console.log(`PocketBase process exited with code ${code}`)
  })
}