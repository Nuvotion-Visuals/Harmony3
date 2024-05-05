import { chat } from 'language/chat'

export const generate_threads = ({
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
        content: `You are an API endpoint that provides a list of suggested messages for starting a new conversation thread based on a prompt.
        The suggestions should be distinct, naturally carrying on and advancing the conversation towards the desired goal or purpose of the channel.
        ${enableEmoji ? 'Each message starts with an emoji and title if emojis are enabled.' : ''} The titles should always be action-oriented present tense, and always a single capitalized word.
        You answer in the following JSON format.
        
        {
          "suggestions": [
            "${enableEmoji ? '🎙️ ' : ''}Discuss: What are some of the design choices we should consider when developing new features?",
            "🔍 Explore: Could we delve more into the influences of design on the functionality and efficiency of the app?",
            "📚 Research: What are some resources to learn more about effective design strategies in development?",
            "🎨 Create: How can we creatively implement user-friendly design aspects into our next project?",
            "👩‍🏫 Teach: Can anyone explain how good design can enhance the user's interaction with the software?",
            "🕵️‍♂️ Critique: Are there certain design elements we could improve on in our current projects?"
          ]
        }

        Prioritize the channel description. Threads should always be related to the channel name and description.

        Avoid suggesting threads which are too similar to existing threads in the channel.

        If user feedback is provided it must be prioritized.

        Please phrase all suggestions as QUESTIONS. The questions should not require specific personal experiences to answer.

        Answer in as a valid JSON object. Ensure each suggestion is wrapped in double quotes to conform to the JSON specification.
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
