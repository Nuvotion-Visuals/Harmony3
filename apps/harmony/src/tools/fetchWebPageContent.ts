import { FunctionTool } from 'llamaindex'
import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'

export async function fetchWebPageContent(url: string): Promise<string> {
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

export const fetchWebPageContent_tool = FunctionTool.from(
  async ({ url }: { url: string }) => {
    return await fetchWebPageContent(url)
  },
  {
    name: 'fetchWebPageContent',
    description: 'Use this function to fetch the text content of a webpage.',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The url from which to fetch webpage content.',
        }
      },
      required: ['url'],
    }
  }
)