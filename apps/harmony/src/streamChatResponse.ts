import ollama from 'ollama'
import OpenAI from 'openai'
import { throttle } from 'lodash'
import { Anthropic, AnthropicAgent, ChatResponseChunk, ContextChatEngine, OpenAIAgent, OpenAIEmbedding, QueryEngineTool } from 'llamaindex'
import { getDocuments } from './documents'
import { Groq, OpenAI as LlamaOpenAI, Ollama, Settings, VectorStoreIndex } from 'llamaindex'
import { ReActAgent } from 'llamaindex'
import { fetchWebPageContent_tool } from './tools/fetchWebPageContent'
import { fetchYouTubeTranscript_tool } from './tools/fetchYouTubeTranscript'
import { fetchWebSearchResults_tool } from './tools/fetchWebSearchResults'
import { fetchForecast_tool } from './tools/fetchForcast'
import { generateImage_tool } from './tools/generateImage'

interface StreamResponsePart {
  message: {
    content: string
  }
  endOfStream?: boolean
}

type StreamCallback = (data: StreamResponsePart) => void

interface StreamChatParams {
  provider: 'Ollama' | 'OpenAI' | 'Groq' | 'Anthropic' | string
  messages: any
  callback: StreamCallback
  retrieve?: boolean
  temperature?: number,
  keys: any,
  agent?: boolean
  model: string
}

export const streamChatResponse = async ({ 
  provider, 
  messages, 
  callback, 
  keys,
  temperature = 0.5,
  retrieve, 
  agent,
  model
}: StreamChatParams) => {
  let fullResponse: string[] = []
  const throttledCallback = throttle(callback, 16.67)

  console.log(`Provider: ${provider}, Model: ${model}`)

  switch(provider) {
    case 'OpenAI': {
      Settings.llm = new LlamaOpenAI({
        apiKey: keys?.OPENAI_API_KEY,
        temperature,
        model
      })
      Settings.embedModel = new OpenAIEmbedding({
        model: 'text-embedding-3-large',
        dimensions: 3072
      });
      break
    }
    case 'Groq': {
      Settings.llm = new Groq({
        apiKey: keys?.GROQ_API_KEY,
        temperature,
        model
      })
      break
    }
    case 'Ollama': {
      Settings.llm = new Ollama({
        model,
        options: {
          temperature
        }
      })
    }
    case 'Anthropic': {
      Settings.llm = new Anthropic({
        apiKey: keys?.ANTHROPIC_API_KEY,
        // @ts-ignore
        model,
        temperature,
      })
    }
  }

  let stream

  if (agent) {
    // @ts-ignore
    const index = await VectorStoreIndex.fromDocuments(await getDocuments())
    const queryEngine = index.asQueryEngine()

     // Create a QueryEngineTool with the query engine
    const queryEngineTool = new QueryEngineTool({
      queryEngine,
      metadata: {
        name: 'harmony_query_engine',
        description: 'A query engine for the Harmony platform of Spaces, Groups, Channels, Threads, and Messages',
      }
    })

    const chatHistory = provider === 'OpenAI' ? messages : [
      {
        role: 'system',
        content: `
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
        `
      },
      ...messages
    ]

    const agent = new (provider === 'OpenAI' ? OpenAIAgent : provider === 'Anthropic' ? AnthropicAgent : ReActAgent)({
      tools: [
        fetchWebPageContent_tool,
        fetchYouTubeTranscript_tool,
        fetchWebSearchResults_tool,
        fetchForecast_tool,
        generateImage_tool,
        queryEngineTool
      ],
      chatHistory
    })
  
    const task = await agent.createTask(
      messages[messages.length - 1]?.content,
      true
    )

    for await (const stepOutput of task) {
      const stream = stepOutput.output as ReadableStream<ChatResponseChunk>
      if (stepOutput.isLast) {
        // @ts-ignore
        for await (const chunk of stream) {
          fullResponse.push(chunk.delta)
          throttledCallback({
            message: {
              content: fullResponse.join('')
            }
          })
        }
      } 
      else {
        console.log("handling function call...")
        const loggedFunctions = new Set()
        // @ts-ignore
        for await (const chunk of stream) {
          const functionName = chunk?.options?.toolCall?.name
          if (functionName && !loggedFunctions.has(functionName)) {
            fullResponse.push(`Performing: ${functionName}. `)
            throttledCallback({
              message: {
                content: fullResponse.join('')
              }
            })
            loggedFunctions.add(functionName)
          }
        }
      }
    }
  }
  else if (retrieve) {
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
    Settings.chunkSize = 512
    // @ts-ignore
    const index = await VectorStoreIndex.fromDocuments(await getDocuments())
    const retriever = index.asRetriever()
    retriever.similarityTopK = 5
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
    if (provider === 'Ollama') {
      stream = await ollama.chat({
        model,
        messages,
        stream: true,
        options: {
          temperature
        }
      })
    }
    // TODO: add Anthropic
    else {
      const llm = new OpenAI({
        apiKey: provider === 'OpenAI' ? keys?.OPENAI_API_KEY : keys?.GROQ_API_KEY,
        baseURL: provider === 'OpenAI' ? undefined : 'https://api.groq.com/openai/v1',
      })
      stream = await llm.chat.completions.create({
        model,
        messages,
        stream: true,
        temperature
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