import { split } from 'sentence-splitter'
import { HTMLToPlaintext } from '@avsync.live/formation'
import { createWatcher } from 'redux-tk/createWatcher'
import { store } from 'redux-tk/store'
import { selectMessageById } from 'redux-tk/spaces/selectors'

import { voiceActions } from 'redux-tk/voice/slice'

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
  const parent = parentElement.querySelector('.message')
  if (!parent) {
    return
  }
  let htmlContent = parent.innerHTML
  htmlContent = removeOldHighlights(htmlContent)
  const highlightedHtml = highlightText(htmlContent, currentlySpeaking)
  parent.innerHTML = highlightedHtml
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\"]/g, '\\$&')
}

const highlightText = (html: string, currentlySpeaking: string | null): string => {
  const openingTag = `<span style="background-color: #312800;">`
  const closingTag = '</span>'
  if (!currentlySpeaking) {
    return html
  }
  const escapedCurrentlySpeaking = escapeRegExp(currentlySpeaking)
  const numberPrefixRegex = /^\d+\.\s+/ // Regex to detect numbering like "1. "
  // This regex allows for punctuation and whitespace to be before or after the term, improving handling of quoted strings
  const searchRegex = new RegExp(`(?<!${numberPrefixRegex.source})(?<![\\w"])${escapedCurrentlySpeaking}(?![\\w"])`, 'gi')
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
  private currentAudioElement: HTMLAudioElement | null = null
  public onComplete: () => void
  public isPaused: boolean = false
  public speed = 1  // Default playback speed

  constructor(private sentences: string[], private baseUrl: string, private guid: string, onComplete?: () => void) {
    this.sentences.forEach(sentence => this.audioDataMap.set(sentence, null))
    this.onComplete = onComplete
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
      this.maybePlayAudio()
    } 
    catch (error) {
      console.error(`Failed to fetch audio for sentence: ${sentence}`, error)
      this.audioDataMap.set(sentence, null)
    }

    this.fetchIndex++
    this.fetchNextAudioElement()
  }

  private maybePlayAudio(): void {
    // Add a check to ensure playback doesn't resume if paused
    if (this.isPaused) {
      return
    }
    if (!this.isPlaying && this.currentSentenceIndex < this.sentences.length) {
      const sentence = this.sentences[this.currentSentenceIndex]
      const audioUrl = this.audioDataMap.get(sentence)
      if (audioUrl) {
        this.playAudio(sentence, audioUrl)
      }
    } else if (this.currentSentenceIndex >= this.sentences.length && !this.isPlaying) {
      this.onComplete && this.onComplete()
    }
  }

  private playAudio(sentence: string, audioUrl: string): void {
    this.currentAudioElement = new Audio(audioUrl)
    this.currentAudioElement.playbackRate = this.speed
    this.isPlaying = true
    this.isPaused = false
    document.body.appendChild(this.currentAudioElement)
    searchAndHighlight(this.guid, sentence)

    this.currentAudioElement.play().then(() => {
      this.currentAudioElement!.onended = () => {
        document.body.removeChild(this.currentAudioElement!)
        URL.revokeObjectURL(audioUrl)
        this.isPlaying = false
        searchAndHighlight(this.guid, null)
        this.currentSentenceIndex++
        this.maybePlayAudio()
      }
    })
  }

  public speak(): void {
    if (!this.isPlaying && !this.isPaused) {
      this.maybePlayAudio()
    }
  }

  public pause(): void {
    if (this.currentAudioElement && this.isPlaying) {
      this.currentAudioElement.pause()
      this.isPlaying = false
      this.isPaused = true
    }
  }

  public play(): void {
    if (this.currentAudioElement && !this.isPlaying && this.isPaused) {
      this.currentAudioElement.play()
      this.isPlaying = true
      this.isPaused = false
    }
  }

  public stop(): void {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause()
      if (this.currentAudioElement.parentNode) {
        document.body.removeChild(this.currentAudioElement)
      }
      URL.revokeObjectURL(this.currentAudioElement.src)
      this.currentAudioElement = null
      this.isPlaying = false
      this.isPaused = false
      this.currentSentenceIndex = this.sentences.length
      searchAndHighlight(this.guid, null)
      this.onComplete && this.onComplete()
    }
  }

  public setSpeed(newSpeed: number): void {
    this.speed = newSpeed
    if (this.currentAudioElement) {
      this.currentAudioElement.playbackRate = newSpeed
    }
  }
}

let synthesizer: SpeechSynthesizer | null = null
let currentSpeed = 1

export async function speak(text: string, guid: string): Promise<void> {
  // Remove all markdown code blocks
  text = text.replace(/```[\s\S]*?```/g, "")

  // Remove single backtick marks, used for inline code
  text = text.replace(/`/g, '')

  // Remove hashtags followed by any word characters
  text = text.replace(/#\w+/g, '')

  // Remove all markdown link texts within square brackets
  text = text.replace(/\[[^\]]*\]/g, '')

  // Remove all asterisks used for markdown emphasis
  text = text.replace(/\*/g, '')

  if (text === '') {
    return
  }

  const baseUrl = 'http://localhost:5003/api/tts'
  const normalizedText = HTMLToPlaintext(text)

  // Manually splitting on semicolons and new lines
  const chunks = normalizedText.split(/[:\n;]/).filter(chunk => chunk.trim().length > 0)
  // Use the split function on each chunk separately and flatten the results
  const sentences = chunks.flatMap(chunk =>
    split(chunk).filter(item => item.type === 'Sentence').map(item => item.raw)
  )

  console.log(sentences)

  if (synthesizer) {
    synthesizer.stop()
  }

  synthesizer = new SpeechSynthesizer(sentences, baseUrl, guid, () => {
    store.dispatch(voiceActions.setMessageId(null))
  })
  synthesizer.setSpeed(currentSpeed)
  synthesizer.speak()
}

createWatcher({
  selectData: () => store.getState().voice.messageId,
  onChange: id => {
    const message = selectMessageById(id)(store.getState())
    if (message) {
      const { text } = message
      console.log(text)
      speak(text, `message_${id}`)
    }
    else if (synthesizer) {
      synthesizer.stop()
    }
  }
})

createWatcher({
  selectData: () => store.getState().voice.speed,
  onChange: speed => {
    currentSpeed = speed
    if (synthesizer) {
      synthesizer.setSpeed(speed)
    }
  }
})

createWatcher({
  selectData: () => store.getState().voice.paused,
  onChange: paused => {
    if (synthesizer) {
      if (paused) {
        console.log('pause')
        synthesizer.pause()
      }
      else {
        synthesizer.play()
        console.log('play')
      }
    }
  }
})