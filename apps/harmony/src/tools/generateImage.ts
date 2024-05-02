import OpenAI from 'openai'
import { getPocketBaseClient, getSystemId } from '../pocketbase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface ImageOptions {
  prompt: string
  size?: '1024x1024' | '1792x1024' | '1024x1792'
  model?: string
  n?: number
}

export async function generateImage(options: ImageOptions): Promise<string> {
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

      const url = `http://localhost:8090/api/files/images/${uploadResponse.id}/${uploadResponse.file}` 
      return url
    }
    return ''
  }
  catch (error) {
    console.error('Error generating image:', error)
    throw error
  }
}

import { FunctionTool } from 'llamaindex'

export const generateImage_tool = FunctionTool.from(
  async ({ options }: { options: ImageOptions }) => {
    const imageUrl = await generateImage(options)
    return { imageUrl }  // Return only imageUrl if successful
  },
  {
    name: 'generateImage',
    description: 'Generate an image based on a text prompt using the OpenAI image model.',
    parameters: {
      type: 'object',
      properties: {
        options: {
          type: 'object',
          description: 'Options to configure the image generation.',
          properties: {
            prompt: {
              type: 'string',
              description: 'Text prompt for the image generation.',
              nullable: false
            },
            size: {
              type: 'string',
              enum: ['1024x1024', '1792x1024', '1024x1792'],
              description: 'The resolution of the generated image.',
              nullable: true
            },
            model: {
              type: 'string',
              default: 'dall-e-3',
              description: 'The model used for generating the image.',
              nullable: true
            },
            n: {
              type: 'integer',
              default: 1,
              description: 'The number of images to generate.',
              nullable: true
            }
          },
          required: ['prompt']
        }
      },
      required: ['options']
    }
  }
)
