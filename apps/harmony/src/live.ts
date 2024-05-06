import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { createServer } from 'http'
const app = require('express')();
const server = createServer(app);

const basePath = process.env.NODE_ENV === 'production'
  ? path.join(process.resourcesPath)
  : process.cwd();

const whisperPath = path.join(basePath, 'whisper', 'bin', 'Release', 'addon.node');
const modelPath = path.join(basePath, 'whisper', 'models', 'ggml-base.en.bin');

const whisperAsync = promisify(require(whisperPath).whisper);

import WebSocket from 'ws'
import { FileWriter } from 'wav'

const wssServer = createServer(server)
const wss = new WebSocket.Server({ server: wssServer })

interface ClientData {
  audioChunks: Buffer[],
  intervalHandle: NodeJS.Timeout | null,
  processingStarted: boolean,
  filePath: string
}

const clients = new Map<number, ClientData>()

wss.on('connection', function connection(ws) {
  const id = Date.now()
  const clientData = {
    audioChunks: [],
    intervalHandle: null,
    processingStarted: false,
    filePath: path.join(__dirname, `audio_${id}.wav`)
  } as ClientData
  clients.set(id, clientData)

  console.log(`Client connected: ${id}`)

  ws.on('message', function incoming(message) {
    const messageData = message.toString('utf8')
    try {
      const data = JSON.parse(messageData)
      if (data.status === 'INIT') {
        ws.send(JSON.stringify({ uid: data.uid, status: 'READY' }))
        console.log(`Sent READY status to client ${id}`)
      } 
      else if (data.audioChunk) {
        const audioBuffer = Buffer.from(data.audioChunk, 'base64')
        clientData.audioChunks.push(audioBuffer)
        console.log(`Buffering audio chunk from client ${id}`)
      }
    } 
    catch (error) {
      console.error(`Error handling message from client ${id}:`, error)
      ws.send(JSON.stringify({ error: 'Error processing your message. Please send valid JSON.' }))
    }
  })

  if (!clientData.intervalHandle) {
    clientData.intervalHandle = setInterval(async () => {
      if (clientData.audioChunks.length > 0 && !clientData.processingStarted) {
        clientData.processingStarted = true

        const writer = new FileWriter(clientData.filePath, {
          sampleRate: 16000,
          channels: 1,
          bitDepth: 16
        })

        clientData.audioChunks.forEach(chunk => writer.write(chunk))
        writer.end()
        clientData.audioChunks.length = 0

        console.log(`Audio file written: ${clientData.filePath}`)

        const result = await whisperAsync({
          language: 'en',
          model: modelPath,
          fname_inp: clientData.filePath,
          use_gpu: true,
          no_timestamps: true
        })
        const text = result?.[0]?.[2]
        if (text && !text.includes('[BLANK_AUDIO]')) {
          ws.send(JSON.stringify({ text }))
        }
        console.log(`Transcription sent to client ${id}`)
        clientData.processingStarted = false
      }
    }, 1000)
  }

  ws.on('close', () => {
    if (clientData.intervalHandle) {
      clearInterval(clientData.intervalHandle)
    }
    clients.delete(id)
    console.log(`Client disconnected: ${id}`)
  })
})

export const initLive = () => {
  wssServer.listen(1615, () => {
    console.log(`Server running on http://localhost:${1615}`)
  })
}
