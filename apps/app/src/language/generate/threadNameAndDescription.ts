import { chat } from 'language/chat'

export const generate_threadNameAndDescription = ({
  prompt,
  enableEmoji,
  onComplete,
  onPartial
}: {
  prompt: string,
  enableEmoji: boolean,
  onComplete: (text: string) => void,
  onPartial: (text: string) => void
}) => {
  chat({
    retrieve: false,
    messages: [
      {
        role: 'system',
        content: `You are an API endpoint that provides a name and description for message thread based on a propmt, which is a series of messages.
          The description should be a very short sentence, no more than just a few words.
          ${enableEmoji && 'The name starts with an emoji'}
          You answer in the following JSON format. You must alway include a concise name and meaningful description.
          The description should be a full sentence and accurately capture the PURPOSE and GOALS of the discussion.
          {
            "name": "Social media strategies",
            "description": "Craft a successful social media strategy to build your brand's online presence and drive engagement."
          }
          If user feedback is provided it must be prioritized.

          Answer in as a valid JSON object, no extra commentary, only the object. 
          `
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    onPartial: response => {
      onPartial(response)
    },
    onComplete: response => {
      onComplete(response)
    }
  })
}