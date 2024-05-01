import ollama from 'ollama'
import OpenAI from 'openai'
import { throttle } from 'lodash'
import { ContextChatEngine, OpenAIAgent } from 'llamaindex'
import { getDocuments } from './documents'
import { Groq, OpenAI as LlamaOpenAI, Ollama, Settings, VectorStoreIndex } from 'llamaindex'
import { ReActAgent } from 'llamaindex'
import { extractWebPageContent_tool, extractYouTubeTranscript_tool } from './extract'

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

interface StreamChatParams {
  provider: 'ollama' | 'openai' | 'groq' | string
  messages: any
  callback: StreamCallback
  index?: boolean
  agent?: boolean
}

export const streamChatResponse = async ({ 
  provider, 
  messages, 
  callback, 
  index, 
  agent 
}: StreamChatParams) => {
  let fullResponse: string[] = []
  const throttledCallback = throttle(callback, 16.67)

  switch(provider) {
    case 'openai': {
      Settings.llm = new LlamaOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.5
      })
      break
    }
    case 'groq': {
      Settings.llm = new Groq({
        apiKey: process.env.GROQ_API_KEY,
        temperature: 0.5
      })
      break
    }
    case 'ollama': {
      Settings.llm = new Ollama({
        model: 'llama3'
      })
    }
  }

  let stream

  if (agent) {
    const agent = new (provider === 'openai' ? OpenAIAgent : ReActAgent)({
      tools: [
        extractWebPageContent_tool,
        extractYouTubeTranscript_tool
      ],
      chatHistory: messages,
      systemPrompt: `
        NEVER ANSWER WITHOUT PREFIXING IT LIKE THIS:
        Answer: [your answer here]

        NEVER EVER REPLY WITHOUT A PREFIX!

        If you don't need any tools, use:
        Input: {}
        NOT:
        Input: None

        Any time you have completed, and have a response ready to present, you MUST finish with an Answer:
        NEVER ANSWER WITHOUT PREFIXING IT LIKE THIS:
        Answer: [your answer here]

        Please do not shorten answers, provide your FULL comprehensive answer, presenting ALL relevant detail in the answer.

        I can't see your message unless it's prefixed with Answer:
      `
    })
  
    const response = await agent.chat({
      message: messages[messages.length - 1]?.content
    })
    const extractAnswer = (input: string): string => input.includes('Answer:') ? input.split('Answer:')[1].trim() : ''
    fullResponse.push(extractAnswer(response.response.message.content as string))
  }
  else if (index) {
    const chatHistory = [
      {
        role: 'system',
        content: `
          You may sometimes be asked to answer queries about the Harmony platform. It is organized into a hirearchy of:
          Spaces -> Groups -> Channels -> Threads -> Messages, which each belonging only to their parent.
          Otherwise, answer as normal.
        `
      },
      ...messages
    ]
    const index = await VectorStoreIndex.fromDocuments(await getDocuments())
    const retriever = index.asRetriever()
    const chatEngine = new ContextChatEngine({ retriever })
    const stream = await chatEngine.chat({ 
      message: messages[messages.length - 1]?.content, 
      chatHistory, 
      stream: true 
    })

    for await (const chunk of stream) {
      fullResponse.push(chunk.response)
      throttledCallback({
        message: {
          content: fullResponse.join('')
        }
      })
    }
  }
  else {
    if (provider === 'ollama') {
      stream = await ollama.chat({
        model: 'llama3',
        messages,
        stream: true
      })
    }
    else {
      stream = await (provider === 'openai' ? openai : groq).chat.completions.create({
        model: provider === 'openai' ? 'gpt-4' : 'llama3-70b-8192',
        messages,
        stream: true
      })
    }
  
    for await (const part of stream) {
      const content = 'choices' in part
        ? part.choices[0]?.delta?.content || ''
        : part.message.content
  
      fullResponse.push(content)
      throttledCallback({
        message: {
          content: fullResponse.join('')
        }
      })
    }
  }

  throttledCallback({ message: { content: fullResponse.join('') }, endOfStream: true })
} 