import { chat } from 'language/chat'

export const generate_image = ({
  prompt,
  onComplete,
  onPartial,
}: {
  prompt: string,
  onComplete: (text: string) => void,
  onPartial: (text: string) => void
}) => {
  chat({
    messages: [
      {
        role: 'system',
        content: `You are an AI language model, and your task is to provide three image prompts to represent the concept provided by the user in a prompt.

        You answer in the following JSON format.
    
        Example:
    
        Name: 📊 finance
        Description: Manage and discuss financial operations.
    
        REMEMBER: that is just an EXAMPLE, the real name and description will be provided in the prompt.
        
        {
          "suggestions": [
            "An image of professionals at a conference table, reviewing financial charts and digital data in a modern office.",
            "A close-up of a computer screen displaying a financial analytics dashboard with complex charts and graphs in an office setting.",
            "A depiction of a global financial network with a digital map showing connections, stock market data, and currency symbols.",
          ]
        }

        If user feedback is provided it MUST be prioritized, and all suggestions should center around the user's direction.
        
        Answer in as a valid JSON object, no extra commentary, only the object. Ensure each suggestion is wrapped in double quotes to conform to the JSON specification.`
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
