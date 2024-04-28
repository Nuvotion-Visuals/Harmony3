import 'dotenv/config'
import { app as electron, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import { spawn } from 'child_process'
import express from 'express'
import path from 'path'
import ollama from 'ollama'
import OpenAI from 'openai'
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
})
import cors from 'cors'
import eventsource from 'eventsource'
// @ts-ignore
global.EventSource = eventsource

// Electron 
autoUpdater.logger = log
electron.commandLine.appendSwitch('force_high_performance_gpu')
let mainWindow: Electron.BrowserWindow | null
let pocketbaseProcess: ReturnType<typeof spawn> | null = null

const createWindow = () => {
  autoUpdater.checkForUpdates()

  mainWindow = new BrowserWindow({
    icon: 'icon.ico',
    width: 1400,
    height: 900,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false
    },
    autoHideMenuBar: true,
    fullscreen: false,
  })

  mainWindow.loadFile('index.html')

  mainWindow.on('closed', () => {
    mainWindow = null
    if (pocketbaseProcess) {
      pocketbaseProcess.kill()
    }
  })

  ipcMain.on('minimize-app', () => {
    mainWindow?.minimize()
  })

  ipcMain.on('maximize-app', () => {
    if (mainWindow) {
      mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
    }
  })
}

interface StreamResponsePart {
  message: {
    content: string
  }
  endOfStream?: boolean
}

type StreamCallback = (data: StreamResponsePart) => void

const streamChatResponse = async (provider: 'ollama' | 'openai' | 'groq', messages: any, callback: StreamCallback) => {
  let fullResponse: string[] = []

  try {
    switch (provider) {
      case 'ollama':
        const ollamaResponse = await ollama.chat({
          model: 'llama3',
          messages,
          stream: true
        })
        for await (const part of ollamaResponse) {
          fullResponse.push(part.message.content)
          callback({
            message: {
              content: fullResponse.join('')
            }
          })
        }
        break

      case 'openai':
        const openaiStream = await openai.chat.completions.create({
          model: 'gpt-4',
          messages,
          stream: true
        })
        for await (const chunk of openaiStream) {
          const content = chunk.choices[0]?.delta?.content || ''
          fullResponse.push(content)
          callback({
            message: {
              content: fullResponse.join('')
            }
          })
        }
        break

      case 'groq':
        const groqStream = await groq.chat.completions.create({
          model: 'llama3-70b-8192',
          messages,
          stream: true
        })
        for await (const chunk of groqStream) {
          const content = chunk.choices[0]?.delta?.content || ''
          fullResponse.push(content)
          callback({
            message: {
              content: fullResponse.join('')
            }
          })
        }
        break
    }

    callback({ message: { content: fullResponse.join('') }, endOfStream: true });
  } 
  catch (error) {
    console.error('Error streaming response:', error)
  }
}

// Chat
const chat = express()
const PORT2 = process.env.PORT2 || 1616
chat.use(cors())
chat.use(express.json())
chat.use(express.urlencoded({ extended: true }))

chat.get('/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const data = req.query.data
  if (typeof data !== 'string') {
    res.status(400).send('Invalid data format')
    return
  }
  let payload
  try {
    payload = JSON.parse(data)
  } 
  catch (error) {
    res.status(400).send('Invalid JSON format')
    return
  }

  if (!['ollama', 'openai', 'groq'].includes(payload.provider)) {
    res.status(400).send('Invalid provider specified')
    return
  }

  streamChatResponse(payload.provider, payload.messages, (data) => {
    if (data.endOfStream) {
      res.write(`data: ${JSON.stringify(data)}\n\n`)
      res.end()
    } 
    else {
      res.write(`data: ${JSON.stringify(data)}\n\n`)
    }
  })

  req.on('close', () => {
    console.log('Client disconnected')
  })
})

chat.listen(PORT2, () => {
  console.log(`Server running on http://localhost:${PORT2}`)
})

export class JsonValidator {
  private lastValidJson: string

  constructor() {
    this.lastValidJson = ''
  }

  public ensureValidJson(str: string): string | null {
    try {
      if (str === 'null') {
        return this.lastValidJson
      }
      JSON.parse(str)
      this.lastValidJson = str
      return str
    } catch (error) {
      let repairedString = str
      let stack: string[] = []
      let withinString = false

      for (let i = 0; i < str.length; i++) {
        const char = str[i]

        if (char === '"' && (i === 0 || str[i - 1] !== '\\')) {
          withinString = !withinString
        }

        if (!withinString) {
          if (char === '{' || char === '[') {
            stack.push(char)
          } else if (char === '}' || char === ']') {
            const lastOpen = stack.pop()
            if (
              (char === '}' && lastOpen !== '{')
              || (char === ']' && lastOpen !== '[')
            ) {
              if (lastOpen) stack.push(lastOpen)
              return this.lastValidJson
            }
          }
        }
      }

      if (withinString) {
        repairedString += '"'
      }

      while (stack.length > 0) {
        const lastOpen = stack.pop()
        if (lastOpen === '{') {
          repairedString += '}'
        } else if (lastOpen === '[') {
          repairedString += ']'
        }
      }

      try {
        JSON.parse(repairedString)
        this.lastValidJson = repairedString
        return repairedString
      } catch (finalError) {
        return this.lastValidJson
      }
    }
  }

  public parseJsonProperty(response: string | null, propertyName: string): string | null {
    const safeJsonString = this.ensureValidJson(response || '') || '{}'
    const parsedObject = JSON.parse(safeJsonString)
    return parsedObject?.[propertyName] || null
  }  
}


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

// Pocketbase Server
const startPocketBase = () => {
  const pocketbasePath = path.join(__dirname, './pocketbase')
  const pocketbaseProcess = spawn(pocketbasePath, ['serve', '--http=0.0.0.0:8090'])

  pocketbaseProcess.stdout.on('data', data => {
    const output = data.toString()
    log.info(`PocketBase: ${output}`)
    if (output.includes('Server started')) {
      initPocketbaseClient()
    }
  })

  pocketbaseProcess.stderr.on('data', data => {
    log.error(`PocketBase Error: ${data.toString()}`)
  })

  pocketbaseProcess.on('exit', code => {
    log.error(`PocketBase process exited with code ${code}`)
  })
}

electron.on('ready', () => {
  startPocketBase()
  createWindow()
})

// TTS
const tts = express()
const PORT = 5003
const TTS_API_URL = 'http://localhost:5002/api/tts'
tts.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

const buildQueryString = (params: any) => {
  return Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
}

tts.get('/api/tts', async (req, res) => {
  const queryString = buildQueryString(req.query)
  const url = `${TTS_API_URL}?${queryString}`

  try {
    const response = await fetch(url, {
      method: 'GET', // Adjust as necessary based on the TTS API's needs
      headers: {
        'Accept': 'audio/wav', // Set appropriately based on expected response type
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.arrayBuffer()
    res.type('audio/wav')
    res.send(Buffer.from(data))
  } 
  catch (error: any) {
    console.error('Error fetching TTS API:', error)
    res.status(500).send(`Failed to fetch data: ${error.message}`)
  }
})

tts.listen(PORT, () => {
  console.log(`TTS running on http://localhost:${PORT}`)
})

