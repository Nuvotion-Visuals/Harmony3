import { chat } from 'language/chat'

export const generate_threadPrompts = ({
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
    messages: [
      {
        role: 'system',
        content: `You are an API endpoint that provides a list of suggested messages for starting a new conversation thread based on a prompt.
        The suggestions should be distinct, naturally carrying on and advancing the conversation towards the desired goal or purpose of the channel.
        Each message starts with an emoji and title if emojis are enabled. The titles should always be action-oriented present tense, and always a single capitalized word.
        You answer in the following JSON format, provided in a code block.
        {
          "suggestions": [
            "${enableEmoji ? '🤔 ': ''}Critique: Suggest a critical review",
            "${enableEmoji ? '🗣️ ': ''}Discuss: Start a discussion",
            "${enableEmoji ? '🔍 ': ''}Explore: Delve into details",
            "${enableEmoji ? '🎓 ': ''}Teach: Provide instructional content",
            "${enableEmoji ? '📚 ': ''}Research: Encourage looking up information",
            "${enableEmoji ? '🎨 ': ''}Create: Inspire creative tasks"
          ]
        }
        If user feedback is provided it must be prioritized.
        Please phrase all suggestions as QUESTIONS.
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
