import { Box, Button, Gap, LoadingSpinner } from '@avsync.live/formation'
import { playSound } from 'hearing/sound'
import React, { useState, useRef, useEffect } from 'react'

interface Props {
  onTranscription: (text: string) => void
  compact?: boolean
}

export const Transcribe = ({
  onTranscription,
  compact
}: Props) => {
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState(null)
  const [error, setError] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const isMounted = useRef(true)
  const [loading, setLoading] = useState(false)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const silenceTimerRef = useRef(null)
  const [hasStartedSpeaking, setHasStartedSpeaking] = useState(false)

  useEffect(() => {
    return () => {
      isMounted.current = false
      clearInterval(silenceTimerRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      audioContextRef.current?.close()
    }
  }, [])

  const handleAudioProcessing = () => {
    const bufferLength = analyserRef.current.fftSize
    const dataArray = new Uint8Array(bufferLength)
    analyserRef.current.getByteFrequencyData(dataArray)
    const averageVolume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length

    if (averageVolume > 5) {
      console.log('Speech detected, setting up or resetting silence timer.')
      setHasStartedSpeaking(true)
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = setTimeout(() => {
        console.log('Silence detected, stopping recording.')
        handleStopRecording()
      }, 1500)
    } 
    else if (hasStartedSpeaking) {
      if (!silenceTimerRef.current) {
        console.log('Starting silence timer after initial speech detected.')
        silenceTimerRef.current = setTimeout(() => {
          console.log('Silence detected, stopping recording.')
          handleStopRecording()
        }, 1500)
      }
    }
  }

  const handleStartRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaRecorderRef.current = new MediaRecorder(stream)
        //@ts-ignore
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
        const source = audioContextRef.current.createMediaStreamSource(stream)
        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 256
        source.connect(analyserRef.current)

        mediaRecorderRef.current.start()
        mediaRecorderRef.current.ondataavailable = event => {
          audioChunksRef.current.push(event.data)
        }
        setRecording(true)
        setError(null)

        setInterval(handleAudioProcessing, 100)

      } 
      catch (err) {
        console.error('Error starting recording:', err)
        setError('Failed to access microphone. Please ensure it is connected and permissions are granted.')
      }
    } 
    else {
      setError('Audio recording is not supported in this browser.')
    }
  }

  const handleStopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return

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
    <Gap autoWidth>
      {
        loading 
          ? <Box 
              width={compact ? 'var(--F_Input_Height_Compact)' : 'var(--F_Input_Height)'} 
              height={compact ? 'var(--F_Input_Height_Compact)' : 'var(--F_Input_Height)'}
            >
              <LoadingSpinner compact />
            </Box>
          : <Button
              icon='microphone'
              iconPrefix='fas'
              circle
              compact={compact}
              minimal
              blink={recording}
              onClick={() => {
                if (recording) {
                  handleStopRecording()
                  playSound('send')
                }
                else {
                  handleStartRecording()
                  playSound('listen')
                }
              }}
            />
      }
    </Gap>
  )
}
