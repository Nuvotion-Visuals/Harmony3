import React, { useState, useRef, useEffect } from 'react'

export const Chat = () => {
  const [message, setMessage] = useState('')
  const [responses, setResponses] = useState([])
  const eventSource = useRef(null)

  useEffect(() => {
    // Clean up the event source when the component unmounts
    return () => {
      if (eventSource.current) {
        eventSource.current.close()
      }
    }
  }, [])

  const handleSendMessage = () => {
    if (eventSource.current) {
      eventSource.current.close()
    }
    eventSource.current = new EventSource(`http://localhost:1616/events?message=${encodeURIComponent(message)}`)

    eventSource.current.onmessage = (event) => {
      const newResponse = JSON.parse(event.data)
      setResponses((prevResponses) => [...prevResponses, newResponse])
    }

    eventSource.current.onerror = (error) => {
      console.error('EventSource failed:', error)
      eventSource.current.close()
    }
  }

  return (
    <div>
    
      <div>
        <h2>Responses:</h2>
        <div>
        {responses.map((response, index) => (
          <>{response.message.content}</>
        ))}
        </div>
       
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
      />
      <button onClick={handleSendMessage}>Send Message</button>
    </div>
  )
}

