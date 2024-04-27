import { app as electron, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import { spawn } from 'child_process'
import express from 'express'
import path from 'path'
import ollama from 'ollama'
import cors from 'cors'
import eventsource from 'eventsource'
// @ts-ignore
global.EventSource = eventsource

log.info('App starting...')

autoUpdater.logger = log
electron.commandLine.appendSwitch('force_high_performance_gpu')

let mainWindow: Electron.BrowserWindow | null
let pocketbaseProcess: ReturnType<typeof spawn> | null = null

const isDevelopment = process.env.NODE_ENV !== 'production'

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


const initPocketbaseClient = async () => {
  const PocketBase = require('pocketbase/cjs')
  const pb = new PocketBase('http://127.0.0.1:8090')

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

        if (llmMessages && assistantMessage.id) {
          const response = await ollama.chat({
            model: 'llama3',
            messages: llmMessages,
            stream: true
          })

          const fullResponse = []

          for await (const part of response) {
            fullResponse.push(part.message.content)
            const partialResponse = fullResponse.join('')
            await pb.collection('messages').update(assistantMessage.id, {
              text: partialResponse
            })
          }

          if (isFirstAssistantMessage) {
            console.log('Complete response and first assistant message in thread')
          }
        }
      }
    })
  }
  catch (e) {
    console.error(e)
  }
}



// Start PocketBase
const startPocketBase = () => {
  const pocketbasePath = path.join(__dirname, './pocketbase')
  const pocketbaseProcess = spawn(pocketbasePath, ['serve', '--http=0.0.0.0:8090'])

  pocketbaseProcess.stdout.on('data', data => {
    const output = data.toString()
    log.info(`PocketBase: ${output}`)
    if (output.includes("Server started")) {
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

// Express Server for Visuals
const visualsApp = express()
const visualsPort = 1
const visualsPath = isDevelopment
  ? path.join(__dirname, '../assets/visuals/dist')
  : path.join(process.resourcesPath, 'assets/visuals/dist')

visualsApp.use((req, res, next) => {
  res.setHeader('Origin-Agent-Cluster', '?1')
  next()
})

visualsApp.use(express.static(visualsPath, { extensions: ['html'] }))

visualsApp.get('*', (req, res) => {
  res.sendFile(path.resolve(visualsPath, 'index.html'))
})

visualsApp.listen(visualsPort, () => {
  log.info(`Visuals server listening on port ${visualsPort}`)
})



const app = express()
const PORT = 5003 // Port number for the proxy server
const TTS_API_URL = 'http://localhost:5002/api/tts' // The base URL for the TTS service
// Enable CORS for all domains
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

// Helper function to construct query string from req.query
const buildQueryString = (params: any) => {
  return Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
}

// Proxy endpoint
app.get('/api/tts', async (req, res) => {
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

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`)
})

const llm = express()
const PORT2 = process.env.PORT2 || 1616
llm.use(cors())
llm.use(express.json())
llm.use(express.urlencoded({ extended: true }))

llm.get('/chat', async (req, res) => {
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

  try {
    const response = await ollama.chat({
      model: 'llama3',
      messages: payload.messages,
      stream: true
    })

    const fullResponse = []

    for await (const part of response) {
      fullResponse.push(part.message.content)
      res.write(`data: ${JSON.stringify({
        ...part,
        message: {
          ...part.message,
          content: fullResponse.join('')
        }
      })}\n\n`)
    }

    res.write(`data: ${JSON.stringify({ endOfStream: true, message: { content: fullResponse.join('')} })}\n\n`)
  } 
  catch (error) {
    console.error('Error streaming response:', error)
    res.status(500).send('Failed to stream response')
  }

  req.on('close', () => {
    console.log('Client disconnected')
    res.end()
  })

  res.on('finish', () => {
    console.log('Response stream closed')
  })
})


llm.listen(PORT2, () => {
  console.log(`Server running on http://localhost:${PORT2}`)
})