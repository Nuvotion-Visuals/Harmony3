import ollama from 'ollama'
import OpenAI from 'openai'
import { throttle } from 'lodash'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
})

interface StreamResponsePart {
  message: {
    content: string
  }
  endOfStream?: boolean
}

type StreamCallback = (data: StreamResponsePart) => void

export const streamChatResponse = async (provider: 'ollama' | 'openai' | 'groq' | string, messages: any, callback: StreamCallback) => {
  let fullResponse: string[] = []
  const throttledCallback = throttle(callback, 16.67)

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
          throttledCallback({
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
          throttledCallback({
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
          throttledCallback({
            message: {
              content: fullResponse.join('')
            }
          })
        }
        break
    }

    throttledCallback({ message: { content: fullResponse.join('') }, endOfStream: true })
  } 
  catch (error) {
    console.error('Error streaming response:', error)
  }
}
