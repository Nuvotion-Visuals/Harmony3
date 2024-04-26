import { split } from 'sentence-splitter'
import { HTMLToPlaintext } from '@avsync.live/formation'

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
}

const highlightText = (html: string, currentlySpeaking: string | null): string => {
  const openingTag = `<span style="background-color: #312800;">`
  const closingTag = '</span>'
  
  if (!currentlySpeaking) {
    return html
  }
  
  const numberPrefixRegex = /^\d+\.\s+/ // Regex to detect numbering like "1. "
  const searchRegex = new RegExp(`(?<!${numberPrefixRegex.source})(?<!\\w)${currentlySpeaking}(?!\\w)`, 'gi') // Avoid highlighting numbering and mid-word matches

  let highlightedHtml = ''
  let startIndex = 0
  let match

  while ((match = searchRegex.exec(html)) !== null) {
    const index = match.index
    const len = match[0].length
    highlightedHtml += html.substring(startIndex, index) + openingTag + html.substring(index, index + len) + closingTag
    startIndex = index + len
  }

  highlightedHtml += html.substring(startIndex)
  return highlightedHtml
}

class SpeechSynthesizer {
  private audioDataMap: Map<string, string | null> = new Map()
  private isPlaying = false
  private currentSentenceIndex = 0
  private fetchIndex = 0

  constructor(private sentences: string[], private baseUrl: string, private guid: string) {
    this.sentences.forEach(sentence => this.audioDataMap.set(sentence, null))
    this.fetchNextAudioElement()
  }

  private async fetchNextAudioElement(): Promise<void> {
    if (this.fetchIndex >= this.sentences.length) {
      return
    }
    const sentence = this.sentences[this.fetchIndex]
    const encodedText = encodeURIComponent(sentence)
    const audioUrl = `${this.baseUrl}?text=${encodedText}&speaker_id=p364&style_wav=&language_id=`

    try {
      const response = await fetch(audioUrl)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      this.audioDataMap.set(sentence, blobUrl)
      this.maybePlayAudio() // Check if we can start playing right away
    } 
    catch (error) {
      console.error(`Failed to fetch audio for sentence: ${sentence}`, error)
      this.audioDataMap.set(sentence, null)
    }

    this.fetchIndex++
    this.fetchNextAudioElement()
  }

  private maybePlayAudio(): void {
    if (!this.isPlaying && this.currentSentenceIndex < this.sentences.length) {
      const sentence = this.sentences[this.currentSentenceIndex]
      const audioUrl = this.audioDataMap.get(sentence)
      if (audioUrl) {
        this.playAudio(sentence, audioUrl)
      }
    }
  }

  private playAudio(sentence: string, audioUrl: string): void {
    const audioElement = new Audio(audioUrl)
    this.isPlaying = true
    document.body.appendChild(audioElement)
    searchAndHighlight(this.guid, sentence)

    audioElement.play().then(() => {
      audioElement.onended = () => {
        document.body.removeChild(audioElement)
        URL.revokeObjectURL(audioUrl)
        this.isPlaying = false
        searchAndHighlight(this.guid, null)
        this.currentSentenceIndex++
        this.maybePlayAudio() // Continue to next audio if available
      }
    })
  }

  public speak(): void {
    this.maybePlayAudio()
  }
}

export async function speak(text: string, guid: string, callback: (error: any) => void): Promise<void> {
  text = text.replace(/```[\s\S]*?```/g, "").replace(/`/g, '').replace(/#\w+/g, '').replace(/\[[^\]]*\]/g, '')

  if (text === '') {
    callback(new Error('No text to speak'))
    return
  }

  const baseUrl = 'http://localhost:5003/api/tts'
  const normalizedText = HTMLToPlaintext(text)
  const sentences = split(normalizedText).filter(item => item.type === 'Sentence').map(item => item.raw)

  const synthesizer = new SpeechSynthesizer(sentences, baseUrl, guid)
  synthesizer.speak()
  callback(null)
}