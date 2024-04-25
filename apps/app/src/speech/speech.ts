import { store } from 'redux-tk/store';
import { split } from 'sentence-splitter';

let targetMessageGuid = ''

const removeOldHighlights = (html: string): string => {
  const openingTag = `<span style="background-color: #312800;">`
  const closingTag = "</span>"
  return html.replace(new RegExp(openingTag, 'g'), '').replace(new RegExp(closingTag, 'g'), '')
}

const searchAndHighlight = async (guid: string, currentlySpeaking: string | null) => {
  await new Promise(resolve => setTimeout(resolve, 50))
  const parentElement = document.getElementById(guid)

  if (!parentElement) {
    console.warn('Element with the given GUID not found.')
    return
  }

  const qlEditorElement = parentElement.querySelector('.message')

  if (!qlEditorElement) {
    console.warn('ql-editor class element not found within the parent.')
    return
  }

  let htmlContent = qlEditorElement.innerHTML
  
  // Remove old highlights
  htmlContent = removeOldHighlights(htmlContent)

  const highlightedHtml = highlightText(htmlContent, currentlySpeaking)
  
  qlEditorElement.innerHTML = highlightedHtml
  console.log('Updated HTML:', qlEditorElement.innerHTML)
}

const highlightText = (html: string, currentlySpeaking: string | null): string => {
  const openingTag = `<span style="background-color: #312800;">`
  const closingTag = '</span>'
  let len = 0
  if (currentlySpeaking) {
    len = currentlySpeaking.length
  }

  let startIndex = 0
  let index = currentlySpeaking ? html.indexOf(currentlySpeaking, startIndex) : -1
  let highlightedHtml = ''

  console.log('Initial index:', index)

  while (index !== -1) {
    highlightedHtml += html.substring(startIndex, index)
    highlightedHtml += openingTag + html.substring(index, index + len) + closingTag
    startIndex = index + len
    index = html.indexOf(currentlySpeaking as string, startIndex)
  }

  highlightedHtml += html.substring(startIndex)

  return highlightedHtml
}
import { HTMLToPlaintext } from '@avsync.live/formation';

class SpeechSynthesizer {
  private audioElements: Array<HTMLAudioElement | null> = [];
  private isPlaying = false;
  private playIndex = 0;

  constructor(private sentences: string[], private baseUrl: string, private guid: string) {
    this.audioElements = new Array(sentences.length).fill(null); // Initialize the array with nulls
  }

  private createAudioElement(text: string, index: number): void {
    const encodedText = encodeURIComponent(text);
    const audioUrl = `${this.baseUrl}?text=${encodedText}&speaker_id=p364&style_wav=&language_id=`;
    const audioElement = new Audio(audioUrl);
    audioElement.playbackRate = 1.15;

    audioElement.onloadedmetadata = () => {
      this.audioElements[index] = audioElement;
      this.tryToPlayAudio(); // Try to play this audio if it's the next in line
    };

    audioElement.onerror = () => {
      console.error(`Failed to load audio for sentence index: ${index}`);
      this.audioElements[index] = null; // Ensure we can skip over this in case of an error
      this.tryToPlayAudio(); // Try to play the next available audio
    };
  }

  private tryToPlayAudio(): void {
    if (this.isPlaying || this.audioElements[this.playIndex] === null) {
      return; // Either something is already playing or the current index audio is not ready
    }

    const audioElement = this.audioElements[this.playIndex];
    if (audioElement) {
      this.isPlaying = true;
      document.body.appendChild(audioElement);
      audioElement.play();

      // Call searchAndHighlight with the currently playing sentence
      searchAndHighlight(this.guid, this.sentences[this.playIndex]);

      audioElement.onended = () => {
        document.body.removeChild(audioElement);
        this.isPlaying = false;

        // Call searchAndHighlight with null to remove the highlight
        searchAndHighlight(this.guid, null);

        this.playIndex++;
        this.tryToPlayAudio(); // Attempt to play the next audio
      };
    }
  }

  public startFetching(): void {
    this.sentences.forEach((sentence, index) => {
      this.createAudioElement(sentence, index);
    });
  }

  public speak(): void {
    // Start playing audios in order as soon as they're ready
    this.tryToPlayAudio();
  }
}

export async function speak(text: string, guid: string, callback: (error: any) => void): Promise<void> {
  text = text.replace(/```[\s\S]*?```/g, "").replace(/`/g, '').replace(/#\w+/g, '').replace(/\[[^\]]*\]/g, '');
  
  if (text === '') {
    callback(new Error('No text to speak'));
    return;
  }

  const baseUrl = 'http://localhost:5002/api/tts'; // Base URL for TTS requests
  const normalizedText = HTMLToPlaintext(text);
  const sentences = split(normalizedText).filter(item => item.type === 'Sentence').map(item => item.raw);

  const synthesizer = new SpeechSynthesizer(sentences, baseUrl, guid);
  synthesizer.startFetching(); // Begin fetching audio data for all sentences
  synthesizer.speak(); // Start the playback process
  callback(null);
}