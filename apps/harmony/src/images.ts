import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface ImageOptions {
  prompt: string
  size?: "1024x1024" | "1792x1024" | "1024x1792"
  model?: string
  n?: number
}

export async function generateImage(options: ImageOptions) {
  const {
    prompt,
    size = "1024x1024",
    model = "dall-e-3",
    n = 1
  } = options
  
  try {
    const response = await openai.images.generate({
      model,
      prompt,
      n,
      size
    })
    return {
      data: response.data
    }
  }
  catch (error) {
    console.error('Error generating image:', error)
    throw error
  }
}
