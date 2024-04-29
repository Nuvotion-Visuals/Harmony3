export type ChatConfig = {
  messages: { role: 'user' | 'assistant' | 'system', content: string }[]
  onPartial: ResponseCallback
  onComplete: ResponseCallback
}

export type ResponseCallback = (response: string) => void

export const chat = (config: ChatConfig): () => void => {
  const payload = { 
    messages: config.messages, 
    provider: 'groq'
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
