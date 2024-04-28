import { spawn } from 'child_process'
import path from 'path'
import { streamChatResponse } from './streamChatResponse'
import { JsonValidator } from './JsonValidator'

// Pocketbase Client
const initPocketbaseClient = async () => {
  const PocketBase = require('pocketbase/cjs')
  const pb = new PocketBase('http://127.0.0.1:8090')
  pb.autoCancellation(false)

  try {
    const user = await pb.collection('users').authWithPassword(
      'harmony',
      'qxIrfPYwKsMxZBQ'
    )

    const systemId = pb.authStore.model?.id

    pb.collection('messages').subscribe('*', async (event: any) => {
      if (event.action === 'create' && event.record.userid !== systemId) {
        let llmMessages
        const threadId = event.record.threadid
        let isFirstAssistantMessage = true

        try {
          const messages = await pb.collection('messages').getFullList({
            filter: `threadid="${threadId}"`,
            sort: 'created'
          })

          llmMessages = messages.map((message: any) => ({
            role: message.userid !== systemId ? 'user' : 'assistant',
            content: message.text
          }))

          // Check if this is the first assistant message in the thread
          isFirstAssistantMessage = messages.every((message: any) => message.userid !== systemId)
        }
        catch (e) {
          console.error(e)
        }

        const assistantMessage = await pb.collection('messages').create({
          text: '', 
          userid: systemId, 
          threadid: threadId
        })

        streamChatResponse('openai', llmMessages, async (data) => {
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
              streamChatResponse('openai', [
                {
                  role: 'system',
                  content: `You are an API endpoint that provides a name and description for message thread based on a propmt, which is a series of messages.
                    The description should be a very short sentence, no more than just a few words.
                    The name starts with an emoji.
                    You answer in the following JSON format.
                    {
                      "name": "Social media strategies",
                      "description": "Craft a successful social media strategy to build your brand's online presence and drive engagement."
                    }
                    If user feedback is provided it must be prioritized.
          
                    Answer in as a valid JSON object, no extra commentary, only the object. 
                    `
                },
                {
                  role: 'user',
                  content: JSON.stringify(updatedLlmMessages)
                }
              ], async (data) => {
                const name =  validator.parseJsonProperty(data.message.content, 'name')
                const description = validator.parseJsonProperty(data.message.content, 'description')

                if (name || description) {
                  await pb.collection('threads').update(threadId, {
                    name,
                    description: description ? description : ''
                  })
                }
              })
            }
          } 
          else {
            await pb.collection('messages').update(assistantMessage.id, {
              text: data.message.content
            })
          }
        })
      }
    })
  }
  catch (e) {
    console.error(e)
  }
}


export const initPocketbase = () => {
  const pocketbasePath = path.join(__dirname, './pocketbase')
  const pocketbaseProcess = spawn(pocketbasePath, ['serve', '--http=0.0.0.0:8090'])

  pocketbaseProcess.stdout.on('data', data => {
    const output = data.toString()
    if (output.includes('Server started')) {
      initPocketbaseClient()
    }
  })

  pocketbaseProcess.stderr.on('data', data => {

  })

  pocketbaseProcess.on('exit', code => {
  
  })
}

