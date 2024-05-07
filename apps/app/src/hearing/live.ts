import { generateUUID } from "@avsync.live/formation";

type TranscriptionCallback = (text: string) => void;

class LiveTranscribe {
  private uuid: string;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private socket: WebSocket | null = null;
  private isServerReady: boolean = false;
  private onTranscription: TranscriptionCallback;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(onTranscription: TranscriptionCallback) {
    this.onTranscription = onTranscription;
    this.uuid = generateUUID();
  }

  async init() {
    this.audioContext = new AudioContext();
    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.connectWebSocket();
  }

  connectWebSocket() {
    this.socket = new WebSocket('ws://localhost:1615');
    this.socket.onopen = () => {
      console.log('WebSocket connection established');
      this.socket?.send(JSON.stringify({ uid: this.uuid, status: 'INIT' }));
    };

    this.socket.onmessage = event => {
      const data = JSON.parse(event.data);
      console.log(data);
      if (data.text) {
        this.onTranscription(data.text);
      }
      if (data.status === 'READY') {
        this.isServerReady = true;
        this.startTranscription()
      }
    };
  }

  async startTranscription() {
    if (!this.mediaStream || !this.audioContext || !this.isServerReady) return;

    await this.audioContext.resume();
    this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    this.processor.onaudioprocess = event => {
      const inputData = event.inputBuffer.getChannelData(0);
      const resampledData = this.resampleTo16kHz(inputData, this.audioContext.sampleRate);
      const outputBuffer = new Int16Array(resampledData.length);
      for (let i = 0; i < resampledData.length; i++) {
        outputBuffer[i] = Math.max(-1, Math.min(1, resampledData[i])) * 32767;
      }
      const binaryString = new Uint8Array(outputBuffer.buffer).reduce((acc, val) => acc + String.fromCharCode(val), '');
      const base64String = btoa(binaryString);
      this.socket?.send(JSON.stringify({ audioChunk: base64String }));
    };

    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  stopTranscription() {
    if (this.processor && this.source && this.audioContext) {
      this.processor.disconnect();
      this.source.disconnect();
      this.processor = null;
      this.source = null;
    }
  }

  disconnectWebSocket() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isServerReady = false;
    }
  }

  cleanUp() {
    this.stopTranscription();
    this.disconnectWebSocket();
    this.mediaStream?.getTracks().forEach(track => track.stop());
    this.audioContext?.close();
    this.audioContext = null;
  }

  private resampleTo16kHz(audioData: Float32Array, origSampleRate: number): Float32Array {
    const targetSampleRate = 16000;
    const targetLength = Math.round(audioData.length * (targetSampleRate / origSampleRate));
    const resampledData = new Float32Array(targetLength);
    const springFactor = (audioData.length - 1) / (targetLength - 1);
    resampledData[0] = audioData[0];
    resampledData[targetLength - 1] = audioData[audioData.length - 1];

    for (let i = 1; i < targetLength - 1; i++) {
      const index = i * springFactor;
      const leftIndex = Math.floor(index);
      const rightIndex = Math.ceil(index);
      const fraction = index - leftIndex;
      resampledData[i] = audioData[leftIndex] + (audioData[rightIndex] - audioData[leftIndex]) * fraction;
    }
    return resampledData;
  }
}

export { LiveTranscribe };