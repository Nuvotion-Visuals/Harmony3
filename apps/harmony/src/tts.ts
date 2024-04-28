import express from 'express'

export const initTts = () => {
  // TTS
  const tts = express()
  const PORT = 5003
  const TTS_API_URL = 'http://localhost:5002/api/tts'

  tts.use((_, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
  })
  
  const buildQueryString = (params: any) => {
    return Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')
  }
  
  tts.get('/api/tts', async (req, res) => {
    const queryString = buildQueryString(req.query)
    const url = `${TTS_API_URL}?${queryString}`
  
    try {
      const response = await fetch(url, {
        method: 'GET', // Adjust as necessary based on the TTS API's needs
        headers: {
          'Accept': 'audio/wav', // Set appropriately based on expected response type
        }
      })
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
  
      const data = await response.arrayBuffer()
      res.type('audio/wav')
      res.send(Buffer.from(data))
    } 
    catch (error: any) {
      console.error('Error fetching TTS API:', error)
      res.status(500).send(`Failed to fetch data: ${error.message}`)
    }
  })
  
  tts.listen(PORT, () => {
    console.log(`TTS running on http://localhost:${PORT}`)
  })
}


