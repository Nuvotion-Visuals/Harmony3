import { promisify } from 'util'
import { app as electron } from 'electron'
import path from 'path'

export const stt = async () => {
  let basePath = electron.getAppPath()
  if (process.env.NODE_ENV === 'production') {
    basePath = path.join(process.resourcesPath)
  }

  const whisperPath = path.join(basePath, 'whisper', 'bin', 'Release', 'addon.node.node')
  const modelPath = path.join(basePath, 'whisper', 'models', 'ggml-base.en.bin')
  const samplePath = path.join(basePath, 'whisper', 'sample', 'jfk.wav')

  const { whisper } = require(whisperPath)
  const whisperAsync = promisify(whisper)
  
  const result = await whisperAsync({
    language: 'en',
    model: modelPath,
    fname_inp: samplePath,
    use_gpu: true,
    no_timestamps: false
  })
  console.log(result)
}
