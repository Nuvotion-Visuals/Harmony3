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

const wssServer = createServer(server)
const wss = new WebSocket.Server({ server: wssServer })

interface ClientData {
  uid: string,
  audioChunks: Buffer[]
  intervalHandle: NodeJS.Timeout | null
  processingStarted: boolean
  filePath: string
  bufferStartTime: number | null
  lastProcessedTime: number
  transcripts: string[]
  finalTranscript: string
  confirmedTranscript: string  // Added to track parts of the transcript that are confirmed
}

const clients = new Map<string, ClientData>()

function mergeTranscripts(clientData: ClientData, newTranscript: string): string {
  const wordsConfirmed = clientData.confirmedTranscript.split(' ')
  const wordsNew = newTranscript.split(' ')
  let commonEndIndex = 0

  // Check if the entire new transcript is already appended
  if (clientData.confirmedTranscript.trim() === newTranscript.trim()) {
    return clientData.confirmedTranscript  // Return as is, no changes needed
  }

  // Try to find overlap between confirmed transcript and new transcript
  for (let i = 1; i <= wordsConfirmed.length; i++) {
    const confirmedEnd = wordsConfirmed.slice(-i).join(' ')
    const newStart = wordsNew.slice(0, i).join(' ')
    if (confirmedEnd === newStart) {
      commonEndIndex = i
      break  // Stop at the first match
    }
  }

  // Update the confirmed part if fully matched, append new information otherwise
  if (commonEndIndex > 0) {
    clientData.confirmedTranscript += ' ' + wordsNew.slice(commonEndIndex).join(' ')
  } 
  else {
    clientData.confirmedTranscript = newTranscript  // Reset if no overlap
  }

  return clientData.confirmedTranscript.trim().replace(/\s{2,}/g, ' ')
}

wss.on('connection', function connection(ws) {
  let clientData = { } as ClientData

  ws.on('message', function incoming(message) {
    const messageData = message.toString('utf8')
    try {
      const data = JSON.parse(messageData)
      if (data.status === 'INIT') {
        clientData = {
          uid: data.uid,
          audioChunks: [],
          intervalHandle: null,
          processingStarted: false,
          filePath: path.join(__dirname, `audio_${data.uid}.wav`),
          bufferStartTime: null,
          lastProcessedTime: Date.now(),
          transcripts: [],
          finalTranscript: '',
          confirmedTranscript: ''
        }
        clients.set(data.uid, clientData)
        clientData.bufferStartTime = Date.now() + 500
        ws.send(JSON.stringify({ uid: data.uid, status: 'READY' }))
      }
      else if (data.audioChunk) {
        const audioBuffer = Buffer.from(data.audioChunk, 'base64')
        clientData.audioChunks.push(audioBuffer)
      }
    }
    catch (error) {
      ws.send(JSON.stringify({ error: 'Error processing your message. Please send valid JSON.' }))
    }
  })

  if (!clientData.intervalHandle) {
    clientData.intervalHandle = setInterval(async () => {
      if (clientData.bufferStartTime && Date.now() > clientData.bufferStartTime && !clientData.processingStarted) {
        clientData.processingStarted = true
        
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
    }, 500)
  }

  ws.on('close', async () => {
    if (clientData.intervalHandle) {
      clearInterval(clientData.intervalHandle)
    }
    clients.delete(clientData.uid)
    await unlink(clientData.filePath)
  })
})

export const initLive = () => {
  wssServer.listen(1615, () => {
    console.log(`Server running on http://localhost:${1615}`)
  })
}
