export type ResponseCallback = (response: string, endOfStream: boolean) => void

export const chat = (messages: { role: 'user' | 'assistant', content: string }[], onResponse: ResponseCallback): () => void => {
  const payload = { messages }  // Directly using the messages array
  const eventSource = new EventSource(`http://localhost:1616/chat?data=${encodeURIComponent(JSON.stringify(payload))}`)

  eventSource.onmessage = event => {
    const data = JSON.parse(event.data)
    if (data.endOfStream) {
      onResponse(data.message.content, true)
    } 
    else {
      onResponse(data.message.content, false)
    }
  }

  eventSource.onerror = error => {
    console.error('EventSource failed:', error)
    eventSource.close()
  }

  return () => eventSource.close()
}