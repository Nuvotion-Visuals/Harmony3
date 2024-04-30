import { StyleHTML, markdownToHTML } from '@avsync.live/formation'
import React, { useState } from 'react'

export const Query = () => {
  const [query, setQuery] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:1616/query?query=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      const result = await response.json()
      setData(result.data)
      setError('')
    } 
    catch (err) {
      setError(err.message)
      setData(null)
    }
  }

  return (
    <div>
      
      <div>
        {data && <StyleHTML>
          <div dangerouslySetInnerHTML={{ __html: markdownToHTML(data || '') || '' }} />
        </StyleHTML>}
        {error && <p>Error: {error}</p>}
      </div>
      <textarea
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Enter your query"
        style={{ width: 'calc(100% - 1rem)', background: 'black', color: '#ccc', padding: '.5rem'}}
      />
      <button onClick={fetchData}>Submit</button>
      
    </div>
  )
}
