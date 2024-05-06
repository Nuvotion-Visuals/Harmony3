import { Box, Button, Gap, LoadingSpinner } from '@avsync.live/formation'
import React, { useState, useRef, useEffect } from 'react'

interface Props {
  onTranscription: (text: string) => void
}

export const Transcribe = ({
  onTranscription
}: Props) => {
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState(null)
  const [error, setError] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const isMounted = useRef(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return () => {
      isMounted.current = false
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

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
      setLoading(true)
      try {
        const formData = new FormData()
        formData.append('file', audioBlob, 'recording.wav')

        const response = await fetch(`http://localhost:1616/transcribe`, {
          method: 'POST',
          body: formData,
        })
        const data = await response.json()

        if (response.ok) {
          if (isMounted.current) {
            setTranscript(data.text)
            onTranscription(data.text)
            setLoading(false)
          }
        } 
        else {
          setLoading(false)
          throw new Error('Failed to transcribe audio.')
        }
      } 
      catch (err) {
        setLoading(false)
        if (isMounted.current) {
          setError(err.message)
        }
      }

      setRecording(false)
      URL.revokeObjectURL(audioUrl)
    }
  }

  return (
    <Gap>
      {
        loading 
          ? <Box width='var(--F_Input_Height)' height='var(--F_Input_Height)'>
              <LoadingSpinner compact />
            </Box>
          : <Button
              icon='microphone'
              iconPrefix='fas'
              circle
              minimal
              blink={recording}
              onClick={recording ? handleStopRecording : handleStartRecording}
            />
      }
    </Gap>
  )
}
