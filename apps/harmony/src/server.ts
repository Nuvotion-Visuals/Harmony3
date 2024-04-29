import cors from 'cors'
import express from 'express'
import { streamChatResponse } from './streamChatResponse'
import { generateImage } from './images'

export const initServer = () => {
  // Chat
  const server = express()
  const PORT2 = process.env.PORT2 || 1616
  server.use(cors())
  server.use(express.json())
  server.use(express.urlencoded({ extended: true }))

  server.get('/chat', async (req, res) => {
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

  server.get('/image', async (req, res) => {
    const { prompt, size, model, n } = req.query
  
    if (typeof prompt !== 'string') {
      res.status(400).send('Invalid or missing prompt')
      return
    }
  
    const numberN = typeof n === 'string' ? parseInt(n, 10) : 1
  
    const validSizes: Array<'1024x1024' | '1792x1024' | '1024x1792'> = ['1024x1024', '1792x1024', '1024x1792'];
    const validSize = typeof size === 'string' && validSizes.includes(size as any) ? size as '1024x1024' | '1792x1024' | '1024x1792' : undefined;
  
    const validModel = typeof model === 'string' ? model : undefined;
  
    try {
      const data = await generateImage({ prompt, size: validSize, model: validModel, n: numberN })
      res.json({ data })
    } 
    catch (error) {
      console.error('Failed to generate image:', error)
      res.status(500).send('Failed to generate image')
    }
  })

  server.listen(PORT2, () => {
    console.log(`Server running on http://localhost:${PORT2}`)
  })
}