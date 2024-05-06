import React, { useState, useRef } from 'react'

export const Transcribe = () => {
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState(null)
  const [error, setError] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const handleStartRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaRecorderRef.current = new MediaRecorder(stream)
        mediaRecorderRef.current.start()

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data)
        }

        setRecording(true)
        setError(null)
      } catch (err) {
        setError('Failed to access microphone. Please ensure it is connected and permissions are granted.')
      }
    } else {
      setError('Audio recording is not supported in this browser.')
    }
  }

  const handleStopRecording = () => {
    if (!mediaRecorderRef.current) return

    mediaRecorderRef.current.stop()
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
      const audioUrl = URL.createObjectURL(audioBlob)
      audioChunksRef.current = []

      try {
        const formData = new FormData()
        formData.append('file', audioBlob, 'recording.wav')

        const response = await fetch(`http://localhost:1616/transcribe`, {
          method: 'POST',
          body: formData,
        })
        const data = await response.json()

        if (response.ok) {
          setTranscript(data)
        } else {
          setError('Failed to transcribe audio.')
        }
      } catch (err) {
        setError('Failed to upload the recording.')
      }

      setRecording(false)
      URL.revokeObjectURL(audioUrl)
    }
  }

  return (
    <div>
      <div>
        {recording ? (
          <button onClick={handleStopRecording}>Stop Recording</button>
        ) : (
          <button onClick={handleStartRecording}>Start Recording</button>
        )}
      </div>
      {error && <p>Error: {error}</p>}
      {transcript && <div>
        <h3>Transcription:</h3>
        <p>{transcript.speech}</p> {/* Adjust according to your API response */}
      </div>}
    </div>
  )
}