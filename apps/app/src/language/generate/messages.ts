import { chat } from 'language/chat'

export const generate_messages = ({
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
        content: `You are an AI language model, and your task is to provide four unique and highly specific suggestions that continue and progress the conversation thread. Each suggestion should reference specific details or themes from previous messages and be presented in a JSON format.

        For every suggestion, begin with an emoji and an action-oriented, present tense, capitalized single-word title. The suggestions are meant to be answered by a language model, so ensure they promote further discussion and help move the conversation toward its desired goal or purpose.
    
        You answer in the following JSON format.
    
        Example:
    
        Topic: Indoor Herb Gardening - Water Management
    
        Previous Messages:
        1. "I've noticed that my indoor herb garden requires different watering techniques compared to outdoor gardens. What should I consider when watering?"
        2. "I've heard about self-watering planters for indoor gardening. How do they work, and are they effective?"
        3. "I'm concerned about over-watering my indoor herb garden. How can I determine the right amount of water for each plant?"
    
        REMEMBER: that is just an EXAMPLE topic, the real topic and messages will be provided in the prompt.
        
        {
          "suggestions": [
            "${enableEmoji ? '💧 ' : ''}Measure: What tools or techniques can help determine the appropriate moisture levels for each herb in an indoor garden?",
            "${enableEmoji ? '🌿 ' : ''}Adapt: How can one adjust their watering schedule to accommodate the specific needs of different herbs in an indoor garden?",
            "${enableEmoji ? '📚 ' : ''}Learn: Are there any resources, such as books or online courses, that can help learn more about proper water management in indoor herb gardening?",
            "${enableEmoji ? '🔄 ' : ''}Recycle: What methods can be employed to recycle water and minimize waste in an indoor herb garden?"
          ]
        }

        Prioritize the thread description. Messages should always be related to the thread name and description.

        Avoid suggesting messages which are too similar to existing messages in the thread.

        If user feedback is provided it MUST be prioritized, and all suggestions should center around the user's direction.
        
        Please phrase all suggestions as QUESTIONS. Answer in as a valid JSON object, no extra commentary, only the object. Ensure each suggestion is wrapped in double quotes to conform to the JSON specification.`
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
