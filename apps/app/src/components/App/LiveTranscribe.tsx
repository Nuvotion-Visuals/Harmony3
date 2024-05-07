import { Button } from "@avsync.live/formation"
import React, { useEffect, useState } from "react"
import { LiveTranscribe as LiveTranscribeClass } from "hearing/live"

interface Props {
  onTranscription: (text: string) => void
  compact?: boolean
}

export const LiveTranscribe = ({
  onTranscription,
  compact
}: Props) => {
  const [transcriber, setTranscriber] = useState<LiveTranscribeClass | null>(null)
  const [isServerReady, setIsServerReady] = useState(false)
  const [isPaused, setIsPaused] = useState(true)

  useEffect(() => {
    return () => {
      transcriber?.cleanUp()
    }
  }, [transcriber])

  const handleButtonClick = async () => {
    if (!transcriber) {
      const transcriberInstance = new LiveTranscribeClass(onTranscription)
      setTranscriber(transcriberInstance)
      await transcriberInstance.init()
      setIsServerReady(true)
      setIsPaused(false)
    } 
    else if (isServerReady && !isPaused) {
      transcriber.pauseTranscription()
      setIsPaused(true)
    } 
    else if (isServerReady && isPaused) {
      transcriber.resumeTranscription()
      setIsPaused(false)
    }
  }

  return (
    <Button
      icon="microphone"
      iconPrefix="fas"
      circle
      compact={compact}
      minimal
      blink={isServerReady && !isPaused}
      onClick={handleButtonClick}
    />
  )
}
