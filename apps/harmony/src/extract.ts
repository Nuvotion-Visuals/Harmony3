import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'
import { FunctionTool } from 'llamaindex'

import { YoutubeTranscript } from 'youtube-transcript'

export async function extractYouTubeTranscript(url: string): Promise<string> {
  const trascript = await YoutubeTranscript.fetchTranscript(url)
  return trascript.map(t => t.text).join(' ')
}

export const extractYouTubeTranscript_tool = FunctionTool.from(
  async ({ url }: { url: string }) => {
    return await extractYouTubeTranscript(url)
  },
  {
    name: 'extractYouTubeTranscript',
    description: 'Use this function to extract the transcript content of a YouTube video.',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The video url from which to extract the transcript.',
        }
      },
      required: ['url'],
    }
  }
)

export async function extractWebPageContent(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const html = await response.text()
    const dom = new JSDOM(html, { url })

    const reader = new Readability(dom.window.document)
    const article = reader.parse()

    return article ? article.textContent : ''
  } 
  catch (error) {
    console.error('Error fetching or parsing content:', error)
    return ''
  }
}

export const extractWebPageContent_tool = FunctionTool.from(
  async ({ url }: { url: string }) => {
    return await extractWebPageContent(url)
  },
  {
    name: 'extractWebPageContent',
    description: 'Use this function to extract the text content of a webpage.',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The url from which to extract webpage content.',
        }
      },
      required: ['url'],
    }
  }
)
