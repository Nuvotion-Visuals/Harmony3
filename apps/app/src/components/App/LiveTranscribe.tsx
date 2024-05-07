import { Button } from "@avsync.live/formation";
import React, { useEffect, useState } from "react";
import { LiveTranscribe as LiveTranscribeClass } from "hearing/live";

interface Props {
  onTranscription: (text: string) => void;
  compact?: boolean;
}

export const LiveTranscribe = ({
  onTranscription,
  compact
}: Props) => {
  const [transcriber, setTranscriber] = useState<LiveTranscribeClass | null>(null);
  const [isServerReady, setIsServerReady] = useState(false);

  const handleButtonClick = async () => {
    if (!transcriber) {
      const transcriberInstance = new LiveTranscribeClass(onTranscription);
      setTranscriber(transcriberInstance);
      await transcriberInstance.init();
      setIsServerReady(true);
    } 
    else if (isServerReady) {
      transcriber.stopTranscription();
      transcriber.disconnectWebSocket();
      setIsServerReady(false);
    }
  };

  return (
    <Button
      icon="microphone"
      iconPrefix="fas"
      circle
      compact={compact}
      minimal
      blink={isServerReady}
      onClick={handleButtonClick}
    />
  );
};
