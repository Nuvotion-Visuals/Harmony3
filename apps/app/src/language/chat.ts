import { selectCurrentUser } from 'redux-tk/spaces/selectors'
import { store } from 'redux-tk/store'

export type ChatConfig = {
  provider?: 'openai' | 'groq' | 'ollama' | string
  model?: string
  retrieve: boolean
  spaceId?: string,
  messages: { role: 'user' | 'assistant' | 'system' | string, content: string }[]
  onPartial: ResponseCallback
  onComplete: ResponseCallback
  agent?: boolean
}

export type ResponseCallback = (response: string) => void

export const chat = (config: ChatConfig): () => void => {
  const keys = selectCurrentUser(store.getState())?.keys
  const { 
    provider = 'groq', 
    model = 'llama3-70b-8192',
    retrieve,
  } = config
  const payload = { 
    messages: config.messages, 
    provider, 
    model,
    retrieve,
    agent: config?.agent,
    spaceId: config?.spaceId,
    keys
  }
  const eventSource = new EventSource(`http://localhost:1616/chat?data=${encodeURIComponent(JSON.stringify(payload))}`)

  eventSource.onmessage = event => {
    const data = JSON.parse(event.data)
    if (data.endOfStream) {
      config.onComplete(data.message.content)
    } 
    else {
      config.onPartial(data.message.content)
    }
  }

  eventSource.onerror = error => {
    console.error('EventSource failed:', error)
    eventSource.close()
  }

  return () => eventSource.close()
}
