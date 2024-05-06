import { promisify } from 'util'
import { app as electron } from 'electron'
import path from 'path'
import fs from 'fs'

const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('ffmpeg-static').replace('app.asar', 'app.asar.unpacked')
const ffprobePath = require('ffprobe-static').path.replace('app.asar', 'app.asar.unpacked')

ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath)

export const stt = async (inputAudioPath: string) => {
  let basePath = electron.getAppPath()
  if (process.env.NODE_ENV === 'production') {
    basePath = path.join(process.resourcesPath)
  }

  const whisperPath = path.join(basePath, 'whisper', 'bin', 'Release', 'addon.node.node')
  const modelPath = path.join(basePath, 'whisper', 'models', 'ggml-base.en.bin')
  const tempDirPath = path.join(__dirname, 'temp')
  const outputAudioPath = path.join(tempDirPath, `transcript-output-${Math.random().toString(36).substring(2, 15)}.wav`)
  if (!fs.existsSync(tempDirPath)) {
    fs.mkdirSync(tempDirPath)
  }
  try {
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(inputAudioPath)
        .audioCodec('pcm_s16le')
        .audioFrequency(16000)
        .audioChannels(1)
        .format('wav')
        .on('error', (err: any) => reject(new Error('An error occurred: ' + err.message)))
        .on('end', resolve)
        .save(outputAudioPath)
    })

    const { whisper } = require(whisperPath)
    const whisperAsync = promisify(whisper)
  
    const result = await whisperAsync({
      language: 'en',
      model: modelPath,
      fname_inp: outputAudioPath,
      use_gpu: true,
      no_timestamps: true
    })

    return {
      text: result?.[0]?.[2]
    }
  } catch (error) {
    console.error(error)
  } 
  finally {
    fs.unlink(outputAudioPath, err => {
      if (err) console.error('Failed to delete the output file:', err)
    })
  }
}