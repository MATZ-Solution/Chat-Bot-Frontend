import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const MODEL_NAME = 'gemini-1.0-pro'
const API_KEY = 'AIzaSyBP5NfEawwgY7BCLXbehd8w3cqoGdJ-OtY'

const GENERATION_CONFIG = {
  temperature: 0.5,
  topK: 90,
  topP: 0.1,
  maxOutputTokens: 2048
}

const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  }
]

const responseTemplate = {
  intent: '<intent>',
  params: {}
}

const intents = {
  intents: [
    {
      id: 'companyInfo',
      description:
        'Inquire about the company or website, such as its mission, services, or contact information.',
      params: []
    },
    {
      id: 'chatbotInfo',
      description: 'Ask about the chatbot.',
      params: []
    },
    {
      id: 'chatbotFeatures',
      description:
        'Inquire about the features and capabilities of the chatbot, including what it can do, services it provides, and information it retrieves.',
      params: []
    },
    {
      id: 'findFacilitiesByLocation',
      description:
        'Find Medicare facilities in a specific city, state, and zip code within a particular category.',
      params: ['city', 'state', 'zipCode', 'category']
    },
    {
      id: 'findNearbyFacilities',
      description: 'Find Medicare facilities nearby based on a given category.',
      params: ['category']
    },
    {
      id: 'searchFacility',
      description: 'Search for a specific Medicare facility by its name.',
      params: ['facilityName']
    },
    {
      id: 'listServices',
      description: 'List the services provided by a specific Medicare facility.',
      params: ['facilityName']
    },
    {
      id: 'listContactInfo',
      description: 'List the contact information for a specific Medicare facility.',
      params: ['facilityName']
    },
    {
      id: 'listFacilityRatings',
      description: 'List the ratings of a specific Medicare facility.',
      params: ['facilityName']
    },
    {
      id: 'checkTopRated',
      description: 'Check if a specific Medicare facility is top-rated.',
      params: ['facilityName']
    },
    {
      id: 'locateFacilityOnMap',
      description: 'Locate a specific Medicare facility on a map.',
      params: ['facilityName']
    },
    {
      id: 'miscellaneous',
      description: 'Handle miscellaneous queries that do not fit into other predefined intents.',
      params: []
    }
  ]
}

const categories = ['nursingHomes', 'inHomeCare', 'rehabilitationCenter', 'memoryCare', 'unknown']

const corePrompts = {
  task: [
    {
      text: `Identify intent and extract parameters from user input as: ${JSON.stringify(intents)}`
    },
    {
      text: `Supported Categories are: ${categories}`
    },
    {
      text: `Return your response in JSON format as: ${JSON.stringify(responseTemplate)}`
    }
  ]
}

const genAI = new GoogleGenerativeAI(API_KEY)

let messageHistory = []

export const sendMessage = async (messages, context = {}) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })

    const userMessages = messages.filter((message) => message.role === 'user')

    const promptMessages = Object.values(corePrompts).flatMap((prompt) =>
      prompt.map((message) => ({ role: 'model', parts: [message] }))
    )
    console.log('prompts:', promptMessages)
    // const historyWithPrompts = [
    //   // ...promptMessages,
    //   ...messages.map((msg) => ({ role: msg.role, parts: [{ text: msg.parts }] }))
    // ]

    // console.log(historyWithPrompts)

    const chat = model.startChat({
      history: promptMessages,
      GENERATION_CONFIG,
      SAFETY_SETTINGS,
      context
    })

    const result = await chat.sendMessage(userMessages[userMessages.length - 1].parts)
    const response = await result.response
    const reply = response.text()
    const replyMessage = {
      role: 'model',
      parts: reply
    }

    const updatedContext = response.context
    const newMessages = [...messages, replyMessage]
    return { data: { choices: [{ message: reply }], context: updatedContext } }
  } catch (error) {
    console.error(error)
    return { data: { choices: [{ message: 'An error occurred' }] } }
  }
}
