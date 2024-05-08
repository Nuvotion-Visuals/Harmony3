import { unlink } from 'fs/promises'
import * as path from 'path'
import { promisify } from 'util'
import { createServer } from 'http'
const app = require('express')()
const server = createServer(app)

const basePath = process.env.NODE_ENV === 'production'
  ? path.join(process.resourcesPath)
  : process.cwd()

const whisperPath = path.join(basePath, 'whisper', 'bin', 'Release', 'addon.node')
const modelPath = path.join(basePath, 'whisper', 'models', 'ggml-tiny.en-q5_1.bin')

const whisperAsync = promisify(require(whisperPath).whisper)

import WebSocket from 'ws'
import { FileWriter } from 'wav'
import { promises as fsPromises } from 'fs'
const wssServer = createServer(server)
const wss = new WebSocket.Server({ server: wssServer })

interface ClientData {
  uid: string
  audioChunks: Buffer[]
  processingStarted: boolean
  filePath: string
  bufferStartTime: number | null
  lastProcessedTime: number
  transcripts: string[]
  finalTranscript: string
  confirmedTranscript: string
  newChunksReceived: boolean
}

const clients = new Map<string, ClientData>()

function mergeTranscripts(clientData: ClientData, newTranscript: string): string {
  const wordsConfirmed = clientData.confirmedTranscript.split(' ')
  const wordsNew = newTranscript.split(' ')
  let commonEndIndex = 0

  if (clientData.confirmedTranscript.trim() === newTranscript.trim()) {
    return clientData.confirmedTranscript
  }

  for (let i = 1; i <= wordsConfirmed.length; i++) {
    const confirmedEnd = wordsConfirmed.slice(-i).join(' ')
    const newStart = wordsNew.slice(0, i).join(' ')
    if (confirmedEnd === newStart) {
      commonEndIndex = i
      break
    }
  }

  if (commonEndIndex > 0) {
    clientData.confirmedTranscript += ' ' + wordsNew.slice(commonEndIndex).join(' ')
  } else {
    clientData.confirmedTranscript = newTranscript
  }

  return clientData.confirmedTranscript.trim().replace(/\s{2,}/g, ' ')
}

wss.on('connection', function connection(ws) {
  let clientData: ClientData = {
    uid: '',
    audioChunks: [],
    processingStarted: false,
    filePath: '',
    bufferStartTime: null,
    lastProcessedTime: 0,
    transcripts: [],
    finalTranscript: '',
    confirmedTranscript: '',
    newChunksReceived: false
  }

  ws.on('message', async function incoming(message) {
    const messageData = message.toString('utf8')
    try {
      const data = JSON.parse(messageData)
      if (data.status === 'INIT') {
        console.log(`client ${data.uid} connected`)

        clientData = {
          uid: data.uid,
          audioChunks: [],
          processingStarted: false,
          filePath: `audio_${data.uid}.wav`,
          bufferStartTime: Date.now() + 1000,
          lastProcessedTime: Date.now(),
          transcripts: [],
          finalTranscript: '',
          confirmedTranscript: '',
          newChunksReceived: false
        }
        clients.set(data.uid, clientData)
        ws.send(JSON.stringify({ uid: data.uid, status: 'READY' }))
      } 
      else if (data.audioChunk) {
        const audioBuffer = Buffer.from(data.audioChunk, 'base64')
        clientData.audioChunks.push(audioBuffer)
        clientData.newChunksReceived = true

        if (!clientData.processingStarted) {
          processAudioChunks(clientData, ws)
        }
      }
    } catch (error) {
      ws.send(JSON.stringify({ error: 'Error processing your message. Please send valid JSON.' }))
    }
  })

  ws.on('close', async () => {
    console.log(`client ${clientData.uid} disconnected`)
    clients.delete(clientData.uid)
    await fsPromises.unlink(clientData.filePath)
  })
})

async function processAudioChunks(clientData: ClientData, ws: WebSocket) {
  if (clientData.newChunksReceived && clientData.bufferStartTime && Date.now() > clientData.bufferStartTime) {
    clientData.processingStarted = true
    clientData.newChunksReceived = false

    const writer = new FileWriter(clientData.filePath, {
      sampleRate: 16000,
      channels: 1,
      bitDepth: 16
    })

    clientData.audioChunks.forEach(chunk => writer.write(chunk))
    writer.end()

    const result = await whisperAsync({
      language: 'en',
      model: modelPath,
      fname_inp: clientData.filePath,
      use_gpu: true,
      no_timestamps: true
    })
    const newTranscript = result?.[0]?.[2] || ''
    if (newTranscript) {
      clientData.finalTranscript = mergeTranscripts(clientData, newTranscript)
      ws.send(JSON.stringify({ text: clientData.finalTranscript }))
    }
    clientData.processingStarted = false
  }
}

export const initLive = () => {
  wssServer.listen(1615, () => {
    console.log(`Server running on http://localhost:${1615}`)
  })
}
