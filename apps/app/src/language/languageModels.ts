type Cost = {
  input: number
  output: number
}

interface LanguageModel {
  name: string
  description: string
  contextWindow: number
  trainingData?: string
  cost: Cost
}

type ModelCollection = Record<string, LanguageModel[]>

export const languageModels: ModelCollection = {
  "OpenAI": [
    {
      "name": "gpt-4-turbo",
      "description": "The latest GPT-4 Turbo model with vision capabilities. Vision requests can now use JSON mode and function calling. Currently points to gpt-4-turbo-2024-04-09.",
      "contextWindow": 128000,
      "trainingData": "Up to Dec 2023",
      cost: { input: 30.00, output: 60.00 }
    },
    {
      "name": "gpt-4-turbo-2024-04-09",
      "description": "GPT-4 Turbo with Vision model. Vision requests can now use JSON mode and function calling. gpt-4-turbo currently points to this version.",
      "contextWindow": 128000,
      "trainingData": "Up to Dec 2023",
      cost: { input: 30.00, output: 60.00 }
    },
    {
      "name": "gpt-4-turbo-preview",
      "description": "GPT-4 Turbo preview model. Currently points to gpt-4-0125-preview.",
      "contextWindow": 128000,
      "trainingData": "Up to Dec 2023",
      cost: { input: 30.00, output: 60.00 }
    },
    {
      "name": "gpt-4-0125-preview",
      "description": "GPT-4 Turbo preview model intended to reduce cases of “laziness” where the model doesn’t complete a task. Returns a maximum of 4,096 output tokens.",
      "contextWindow": 128000,
      "trainingData": "Up to Dec 2023",
      cost: { input: 30.00, output: 60.00 }
    },
    {
      "name": "gpt-4-1106-preview",
      "description": "GPT-4 Turbo preview model featuring improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Returns a maximum of 4,096 output tokens. This is a preview model.",
      "contextWindow": 128000,
      "trainingData": "Up to Apr 2023",
      cost: { input: 30.00, output: 60.00 }
    },
    {
      "name": "gpt-4-vision-preview",
      "description": "GPT-4 model with the ability to understand images, in addition to all other GPT-4 Turbo capabilities. This is a preview model, we recommend developers to now use gpt-4-turbo which includes vision capabilities. Currently points to gpt-4-1106-vision-preview.",
      "contextWindow": 128000,
      "trainingData": "Up to Apr 2023",
      cost: { input: 30.00, output: 60.00 }
    },
    {
      "name": "gpt-4-1106-vision-preview",
      "description": "GPT-4 model with the ability to understand images, in addition to all other GPT-4 Turbo capabilities. This is a preview model, we recommend developers to now use gpt-4-turbo which includes vision capabilities. Returns a maximum of 4,096 output tokens.",
      "contextWindow": 128000,
      "trainingData": "Up to Apr 2023",
      cost: { input: 30.00, output: 60.00 }
    },
    {
      "name": "gpt-4",
      "description": "Currently points to gpt-4-0613. See continuous model upgrades.",
      "contextWindow": 8192,
      "trainingData": "Up to Sep 2021",
      cost: { input: 30.00, output: 60.00 }
    },
    {
      "name": "gpt-4-0613",
      "description": "Snapshot of gpt-4 from June 13th 2023 with improved function calling support.",
      "contextWindow": 8192,
      "trainingData": "Up to Sep 2021",
      cost: { input: 30.00, output: 60.00 }
    },
    {
      "name": "gpt-4-32k",
      "description": "Currently points to gpt-4-32k-0613. See continuous model upgrades. This model was never rolled out widely in favor of GPT-4 Turbo.",
      "contextWindow": 32768,
      "trainingData": "Up to Sep 2021",
      cost: { input: 30.00, output: 60.00 }
    },
    {
      "name": "gpt-4-32k-0613",
      "description": "Snapshot of gpt-4-32k from June 13th 2023 with improved function calling support. This model was never rolled out widely in favor of GPT-4 Turbo.",
      "contextWindow": 32768,
      "trainingData": "Up to Sep 2021",
      cost: { input: 30.00, output: 60.00 }
    },
    {
      "name": "gpt-3.5-turbo-0125",
      "description": "The latest GPT-3.5 Turbo model with higher accuracy at responding in requested formats and a fix for a bug which caused a text encoding issue for non-English language function calls. Returns a maximum of 4,096 output tokens.",
      "contextWindow": 16385,
      "trainingData": "Up to Sep 2021",
      cost: { input: 0.50, output: 1.50 }
    },
    {
      "name": "gpt-3.5-turbo",
      "description": "Currently points to gpt-3.5-turbo-0125.",
      "contextWindow": 16385,
      "trainingData": "Up to Sep 2021",
      cost: { input: 0.50, output: 1.50 }
    },
    {
      "name": "gpt-3.5-turbo-1106",
      "description": "GPT-3.5 Turbo model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Returns a maximum of 4,096 output tokens.",
      "contextWindow": 16385,
      "trainingData": "Up to Sep 2021",
      cost: { input: 0.50, output: 1.50 }
    },
    {
      "name": "gpt-3.5-turbo-instruct",
      "description": "Similar capabilities as GPT-3 era models. Compatible with legacy Completions endpoint and not Chat Completions.",
      "contextWindow": 4096,
      "trainingData": "Up to Sep 2021",
      cost: { input: 0.50, output: 1.50 }
    }
  ],    
  "Groq": [
    {
      name: "gemma-7b-it",
      description: "Gemma is a family of lightweight, state-of-the-art open models from Google, built from the same research and technology used to create the Gemini models. They are text-to-text, decoder-only large language models, available in English, with open weights, pre-trained variants, and instruction-tuned variants. Gemma models are well-suited for a variety of text generation tasks, including question answering, summarization, and reasoning. Their relatively small size makes it possible to deploy them in environments with limited resources such as a laptop, desktop or your own cloud infrastructure, democratizing access to state of the art AI models and helping foster innovation for everyone.",
      contextWindow: 8192,
      cost: { input: 0.10, output: 0.10 }
    },
    {
      name: "llama3-70b-8192",
      description: "Meta Llama 3, a family of models developed by Meta Inc., are new state-of-the-art, available in both 8B and 70B parameter sizes (pre-trained or instruction-tuned).",
      contextWindow: 8192,
      cost: { input: 0.59, output: 0.79 }
    },
    {
      name: "llama3-8b-8192",
      description: "Meta Llama 3, a family of models developed by Meta Inc., are new state-of-the-art, available in both 8B and 70B parameter sizes (pre-trained or instruction-tuned).",
      contextWindow: 8192,
      cost: { input: 0.05, output: 0.10 }
    },
    {
      name: "mixtral-8x7b-32768",
      description: "Mixtral 8x22B sets a new standard for performance and efficiency within the AI community. It is a sparse Mixture-of-Experts (SMoE) model that uses only 39B active parameters out of 141B, offering unparalleled cost efficiency for its size.",
      contextWindow: 32768,
      cost: { input: 0.27, output: 0.27 }
    }
  ],
  'Ollama': [
    {
      "name": "llama3:8b",
      "description": "Meta Llama 3, a family of models developed by Meta Inc., are new state-of-the-art, available in both 8B and 70B parameter sizes (pre-trained or instruction-tuned).",
      "contextWindow": 8192,
      cost: { input: 0, output: 0 }
    },
  ],
  "Anthropic": [
    {
      "name": "claude-3-opus-20240229",
      "description": "Our most powerful model, delivering state-of-the-art performance on highly complex tasks and demonstrating fluency and human-like understanding. Top-level performance, intelligence, fluency, and understanding are its strengths. It supports multilingual capabilities and vision with a 200K tokens context window.",
      "contextWindow": 200000,
      "cost": {
        "input": 15,
        "output": 75
      }
    },
    {
      "name": "claude-3-sonnet-20240229",
      "description": "Our most balanced model between intelligence and speed, a great choice for enterprise workloads and scaled AI deployments. It offers maximum utility at a lower price, dependable, and is balanced for scaled deployments. It supports multilingual capabilities and vision with a 200K tokens context window.",
      "contextWindow": 200000,
      "cost": {
        "input": 3,
        "output": 15
      }
    },
    {
      "name": "claude-3-haiku-20240307",
      "description": "Our fastest and most compact model, designed for near-instant responsiveness and seamless AI experiences that mimic human interactions. Quick and accurate targeted performance characterizes this model. It supports multilingual capabilities and vision with a 200K tokens context window.",
      "contextWindow": 200000,
      "cost": {
        "input": 0.25,
        "output": 1.25
      }
    },
    {
      "name": "claude-2.1",
      "description": "Updated version of Claude 2 with improved accuracy. It is a legacy model, performing less well than Claude 3 models. It supports multilingual capabilities, but with less coverage, understanding, and skill than Claude 3. No vision capability.",
      "contextWindow": 200000,
      "cost": {
        "input": 8,
        "output": 24
      }
    },
    {
      "name": "claude-2.0",
      "description": "Predecessor to Claude 3, offering strong all-round performance. It is a legacy model, performing less well than Claude 3 models. It supports multilingual capabilities, but with less coverage, understanding, and skill than Claude 3. No vision capability.",
      "contextWindow": 100000,
      "cost": {
        "input": 8,
        "output": 24
      }
    },
    {
      "name": "claude-instant-1.2",
      "description": "Our cheapest small and fast model, a predecessor of Claude Haiku. It is a legacy model, performing less well than Claude 3 models. It supports multilingual capabilities, but with less coverage, understanding, and skill than Claude 3. No vision capability.",
      "contextWindow": 100000,
      "cost": {
        "input": 0.80,
        "output": 2.40
      }
    }
  ]
}