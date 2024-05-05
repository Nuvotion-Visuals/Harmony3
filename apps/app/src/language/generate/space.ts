import { chat } from 'language/chat'

export const generate_space = ({
  prompt,
  enableEmoji,
  onComplete,
  onPartial,
}: {
  prompt: string,
  enableEmoji: boolean,
  onComplete: (text: string) => void,
  onPartial: (text: string) => void
}) => {
  chat({
    retrieve: true,
    messages: [
      {
        role: 'system',
        content: `
          You are an API endpoint that provides a list of Groups and Channels for a project management app based on a description.

          You answer in the following JSON format, and completing the TODOs. Your answer has 5 groups, with 4 channels each.

          ${enableEmoji && 'Each group and channel name starts with an emoji'}

          {
            "groups":[
              {
                "name": "${enableEmoji && '🚀 '}Projects",
                "description": "Manage projects.",
                "channels":[
                  {
                    "name":"${enableEmoji && '💬 '}general",
                    "description":"General discussion about music projects."
                  },
                  // TODO: add 4 total channels
                ]
              },
              // TODO: add 4 groups, 
            ]
          }

          If user feedback is provided it must be prioritized.
          
          Answer in as a valid JSON object, no extra commentary, only the object. Ensure each suggestion is wrapped in double quotes to conform to the JSON specification.
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
