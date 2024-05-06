export function listenForWakeWord(callback: () => void) {
  // @ts-ignore
  const SpeechGrammarList = window.webkitSpeechGrammarList
  // @ts-ignore
  const recognition = new webkitSpeechRecognition()
  recognition.continuous = true
  recognition.interimResults = false
  recognition.lang = 'en-US'
  
  const wakeWord = 'Harmony'
  if (SpeechGrammarList !== undefined) {
    const speechRecognitionList = new SpeechGrammarList()
    const g_wakeWord = `#ABNF 1.0 UTF-8 mode voice root $main public $main = ${wakeWord}`
    speechRecognitionList.addFromString(g_wakeWord, 1)
    recognition.grammars = speechRecognitionList
    recognition.start()
    recognition.onended = () => 'not listening'
    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript
      if (result === wakeWord) {
        callback()
      }
    }
  }
}