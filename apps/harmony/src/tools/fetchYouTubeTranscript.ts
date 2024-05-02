import { FunctionTool } from 'llamaindex'

import { YoutubeTranscript } from 'youtube-transcript'

export async function fetchYouTubeTranscript(url: string): Promise<string> {
  const trascript = await YoutubeTranscript.fetchTranscript(url)
  return trascript.map(t => t.text).join(' ')
}

export const fetchYouTubeTranscript_tool = FunctionTool.from(
  async ({ url }: { url: string }) => {
    return await fetchYouTubeTranscript(url)
  },
  {
    name: 'fetchYouTubeTranscript',
    description: 'Use this function to fetch the transcript content of a YouTube video.',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The video url from which to fetch the transcript.',
        }
      },
      required: ['url'],
    }
  }
)
