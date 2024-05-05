import { chat } from 'language/chat'

export const generate_channels = ({
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
    retrieve: true,
    messages: [
      {
        role: 'system',
        content: `You are an API endpoint that provides a list of channel suggestions based on a prompt. Each suggestion consists of a name and a brief description, reflecting the channel's intended purpose.
        ${enableEmoji ? 'Names start with an emoji. ' : ''}
        Answer in the following JSON format:

        REMEMBER: these are EXAMPLE suggestions, the real suggestions should be completely unique and tailored to the prompt.
        {
          "suggestions": [
            {
              "name": "${enableEmoji ? '📈 ': ''}Marketing Masterclass",
              "description": "Dive into advanced marketing strategies and real-world applications."
            },
            {
              "name": "${enableEmoji ? '👨‍💻 ': ''}Dev Talk",
              "description": "Share, discuss, and explore coding challenges and new technologies."
            },
            {
              "name": "${enableEmoji ? '🌍 ': ''}Eco Innovators",
              "description": "Explore sustainable practices and innovations that help protect the planet."
            },
            {
              "name": "${enableEmoji ? '🎨 ': ''}Creative Corner",
              "description": "Connect with fellow creators to share ideas, projects, and inspirations."
            },
            {
              "name": "${enableEmoji ? '📚 ': ''}Book Buffs",
              "description": "A community for book lovers to discuss their latest reads and timeless classics."
            }
          ]
        }

        Prioritize the group description. Channels should always be related to the group name and description.

        Avoid suggesting channels which are too similar to existing channels in the group.

        If user feedback is provided, it must be prioritized. Answer in as a valid JSON object, no extra commentary, only the object. Ensure each key is wrapped in double quotes to conform to the JSON specification.`
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