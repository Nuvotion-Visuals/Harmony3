import { generateUUID } from '@avsync.live/formation'
import React, { useState, useEffect } from 'react'

export const Live = () => {
  const [audioContext, setAudioContext] = useState(null)
  const [mediaStream, setMediaStream] = useState(null)
  const [socket, setSocket] = useState(null)
  const [isServerReady, setIsServerReady] = useState(false)
  const [uuid, setUuid] = useState('')
  const [transcription, setTranscription] = useState('')

  const connectWebSocket = () => {
    const ws = new WebSocket('ws://localhost:1615')
    setSocket(ws)
    ws.onopen = () => {
      console.log('WebSocket connection established')
      ws.send(JSON.stringify({ uid: uuid, status: 'INIT' }))
    }

    ws.onmessage = event => {
      const data = JSON.parse(event.data)
      if (data.text) {
        setTranscription(currentTranscription => currentTranscription + data.text)
      }
      if (data.uid !== uuid) return
      if (data.status === 'READY') {
        setIsServerReady(true)
      }
    }
  }

  const disconnectWebSocket = () => {
    if (socket) {
      socket.close()
      setSocket(null)
      setIsServerReady(false)
    }
  }

  useEffect(() => {
    setUuid(generateUUID())

    connectWebSocket()

    const initAudio = async () => {
      const context = new AudioContext()
      setAudioContext(context)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setMediaStream(stream)
      context.resume()
    }

    initAudio()

    return () => {
      disconnectWebSocket()
      mediaStream?.getTracks().forEach(track => track.stop())
      audioContext?.close()
    }
  }, [])

  useEffect(() => {
    if (!mediaStream || !audioContext || !isServerReady) return

    const source = audioContext.createMediaStreamSource(mediaStream)
    const processor = audioContext.createScriptProcessor(4096, 1, 1)

    processor.onaudioprocess = event => {
      const inputData = event.inputBuffer.getChannelData(0)
      const resampledData = resampleTo16kHz(inputData, audioContext.sampleRate)
      const outputBuffer = new Int16Array(resampledData.length)
      for (let i = 0; i < resampledData.length; i++) {
        outputBuffer[i] = Math.max(-1, Math.min(1, resampledData[i])) * 32767
      }
      const binaryString = new Uint8Array(outputBuffer.buffer).reduce((acc, val) => acc + String.fromCharCode(val), '')
      const base64String = btoa(binaryString)
      socket.send(JSON.stringify({ audioChunk: base64String }))
    }

    source.connect(processor)
    processor.connect(audioContext.destination)
  }, [mediaStream, audioContext, isServerReady, socket])

  const resampleTo16kHz = (audioData, origSampleRate) => {
    const targetSampleRate = 16000
    const targetLength = Math.round(audioData.length * (targetSampleRate / origSampleRate))
    const resampledData = new Float32Array(targetLength)
    const springFactor = (audioData.length - 1) / (targetLength - 1)
    resampledData[0] = audioData[0]
    resampledData[targetLength - 1] = audioData[audioData.length - 1]

    for (let i = 1; i < targetLength - 1; i++) {
      const index = i * springFactor
      const leftIndex = Math.floor(index)
      const rightIndex = Math.ceil(index)
      const fraction = index - leftIndex
      resampledData[i] = audioData[leftIndex] + (audioData[rightIndex] - audioData[leftIndex]) * fraction
    }
    return resampledData
  }

  return (
    <div>
      <h1>Live Audio Processing</h1>
      <p>Status: {isServerReady ? 'Server Ready' : 'Connecting...'}</p>
      <p>{transcription}</p>
      <button onClick={connectWebSocket}>Reconnect</button>
      <button onClick={disconnectWebSocket}>Disconnect</button>
      <button onClick={() => setTranscription('')}>Clear</button>
    </div>
  )
}
