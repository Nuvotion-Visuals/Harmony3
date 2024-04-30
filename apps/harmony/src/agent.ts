import { Groq, Settings } from 'llamaindex'
Settings.llm = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0,
  model: 'llama3-70b-8192'
})

import { FunctionTool, ReActAgent } from "llamaindex"

import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'

async function fetchMainContent2(url: string): Promise<string> {
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
  } catch (error) {
    console.error('Error fetching or parsing content:', error)
    return ''
  }
}

const fetchMainContent = FunctionTool.from(
  async ({ url }: { url: string }) => {
    return await fetchMainContent2(url)
  },
  {
    name: "extractWebPageContent",
    description: "Use this function to extract the text content of a webpage.",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The url from which to extract webpage content.",
        },
      },
      required: ["url"],
    },
  },
);

import { argv } from 'process'

async function main() {
  const message = argv[2]

  const agent = new ReActAgent({
    tools: [fetchMainContent],
    chatHistory: [
      {
        role: 'system',
        content: `
          NEVER ANSWER WITHOUT PREFIXING IT LIKE THIS:
          Answer: [your answer here]

          NEVER EVER REPLY WITHOUT A PREFIX!

          If you don't need any tools, use:
          Input: {}
          NOT:
          Input: None
        `
      }
    ]
  })

  const response = await agent.chat({
    message
  })
  console.log(JSON.stringify(response))
}

void main().then(() => {
  console.log("Done")
})

