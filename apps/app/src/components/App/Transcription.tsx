import { useState, useEffect, useRef } from 'react'
import { SpeechTranscription } from 'hearing/speechTranscription'
import { listenForWakeWord } from 'hearing/wakeWord'
import { playSound } from 'hearing/sound'

interface Props {
  onTranscription: (text: string) => void
}

export const Transcription = ({ onTranscription }: Props) => {
  const { query } = useHearing()
  useEffect(() => {
    onTranscription(query)
  }, [query])
  return <></>
}

export const useHearing = () => {
  const [query, setQuery] = useState('')

  // Speech Transcription
  const [disableTimer, set_disableTimer] = useState(true)
  useEffect(() => {
    let timer = {} as any
    if (query !== '<p><br><p>' && !disableTimer) {
      timer = setTimeout(() => {
        // send(query)
        set_disableTimer(true)
        playSound('send')
        stop()
        set_finalTranscript('')
      }, 1500)
    }
    return () => {
      clearTimeout(timer)
    }
  }, [query, disableTimer])

  const [finalTranscript, set_finalTranscript] = useState('')
  const [interimTranscript, set_interimTranscript] = useState('')
  const [originalValueBeforeInterim, set_originalValueBeforeInterim] = useState('')

  useEffect(() => {
    if (finalTranscript) {
      set_disableTimer(false)
      setQuery(finalTranscript)
      set_originalValueBeforeInterim(finalTranscript)
    }
  }, [finalTranscript])

  useEffect(() => {
    if (interimTranscript) {
      setQuery(originalValueBeforeInterim + interimTranscript)
    }
  }, [interimTranscript])

  const { listen, listening, stopListening, clear } = SpeechTranscription({
    onFinalTranscript: (result) => {
      set_finalTranscript(result)
    },
    onInterimTranscript: (result) => {
      set_interimTranscript(result)
      set_disableTimer(true)
    }
  })

  const start = () => {
    set_originalValueBeforeInterim(query)
    listen()
  }

  const stop = () => {
    stopListening()
    set_disableTimer(true)
    set_interimTranscript('')
    clear()
  }

  const hearingRef = useRef(listening)
  useEffect(() => {
    hearingRef.current = listening
  }, [listening])

  useEffect(() => {
    listenForWakeWord(() => start())
    setInterval(() => {
      if (hearingRef.current === false) {
        listenForWakeWord(() => start())
      }
    }, 8000)
  }, [])

  useEffect(() => {
    if (listening) {
      playSound('listen')
    }
  }, [listening])

 return {
    query
 }
}

