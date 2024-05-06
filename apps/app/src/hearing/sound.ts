type SoundName = 'wake' | 'listen' | 'stop-listening' | 'ask' | 'error' | 'send'

export const playSound = (name: SoundName) => {
  const audio = new Audio(`/sounds/${name}.wav`)
  audio.play()
}