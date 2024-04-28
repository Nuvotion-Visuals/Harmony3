import cors from 'cors'
import express from 'express'
import { streamChatResponse } from './streamChatResponse'

export const initChat = () => {
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
}