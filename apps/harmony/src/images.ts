import OpenAI from 'openai'
import { getPocketBaseClient, getSystemId } from './pocketbase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface ImageOptions {
  prompt: string
  size?: '1024x1024' | '1792x1024' | '1024x1792'
  model?: string
  n?: number
}

export async function generateImage(options: ImageOptions) {
  const pb = getPocketBaseClient()
  const systemId = getSystemId()

  const {
    prompt,
    size = '1024x1024',
    model = 'dall-e-3',
    n = 1
  } = options
  
  try {
    const response = await openai.images.generate({
      model,
      prompt,
      n,
      size
    })

    const imageUrl = response.data?.[0]?.url
    const adjustedPrompt = response.data?.[0]?.revised_prompt

    if (imageUrl && systemId) {
      const response = await fetch(imageUrl)
      const arrayBuffer = await response.arrayBuffer()
      const blob = new Blob([arrayBuffer], { type: response.headers.get('content-type') || '' })
      const formData = new FormData()
      formData.append('file', blob, 'image.jpg')
      formData.append('prompt', adjustedPrompt || prompt)
      formData.append('userid', systemId)

      const uploadResponse = await pb.collection('images').create(formData)
      console.log(uploadResponse)
      return {
        data: uploadResponse
      }
    }
  }
  catch (error) {
    console.error('Error generating image:', error)
    throw error
  }
}
