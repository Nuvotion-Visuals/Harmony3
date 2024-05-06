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
const clients = new Map()

wss.on('connection', function connection(ws) {
  const id = Date.now()
  const audioChunks: Buffer[] = []
  let intervalHandle: NodeJS.Timeout | null = null
  let processingStarted = false

  console.log(`Client connected: ${id}`)
  clients.set(id, ws)

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
        audioChunks.push(audioBuffer)
        console.log(`Buffering audio chunk from client ${id}`)
      }
    } 
    catch (error) {
      console.error(`Error handling message from client ${id}:`, error)
      ws.send(JSON.stringify({ error: 'Error processing your message. Please send valid JSON.' }))
    }
  })

  if (!intervalHandle) {
    intervalHandle = setInterval(async () => {
      if (audioChunks.length > 0 && !processingStarted) {
        processingStarted = true
        const filePath = path.join(__dirname, `audio_${id}.wav`)
        const sampleRate = 16000
        const bitDepth = 16
        const channels = 1

        const writer = new FileWriter(filePath, {
          sampleRate,
          channels,
          bitDepth
        })

        audioChunks.forEach(chunk => writer.write(chunk))
        writer.end()
        audioChunks.length = 0

        console.log(`Audio file written: ${filePath}`)

        const result = await whisperAsync({
          language: 'en',
          model: modelPath,
          fname_inp: filePath,
          use_gpu: true,
          no_timestamps: true
        })
        const text = result?.[0]?.[2]
        if (!text?.includes('[BLANK_AUDIO]')) {
          ws.send(JSON.stringify({ text }))
        }
        console.log(`Transcription sent to client ${id}`)
        processingStarted = false
      }
    }, 1000)
  }

  ws.on('close', () => {
    if (intervalHandle) {
      clearInterval(intervalHandle)
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
