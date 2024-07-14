import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const MODEL_NAME = 'gemini-1.0-pro'
const API_KEY = 'AIzaSyBP5NfEawwgY7BCLXbehd8w3cqoGdJ-OtY'
const GEN_AI = new GoogleGenerativeAI(API_KEY)

const BACKEND_URI = 'http://localhost:3000/api/'

const GENERATION_CONFIG = {
  temperature: 0.5,
  topK: 90,
  topP: 0.1,
  maxOutputTokens: 2048
}

const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE
  }
]

const RESPONSE_TEMPLATE = {
  intent: '<intent>',
  params: {}
}

const SUCCESS_RESPONSE_TEMPLATE = {
  success: true,
  intent: '<intent>',
  params: {}
}

const FAILURE_RESPONSE_TEMPLATE = {
  success: false,
  error: '<error message>'
}

const INTENTS = {
  intents: [
    {
      id: 'company-info',
      description:
        'Inquire about the company or website, such as its mission, services, or contact information.',
      params: []
    },
    {
      id: 'chatbot-info',
      description: 'Ask about the chatbot.',
      params: []
    },
    {
      id: 'chatbot-features',
      description:
        'Inquire about the features and capabilities of the chatbot, including what it can do, services it provides, and information it retrieves.',
      params: []
    },
    {
      id: 'find-facilities-by-location',
      description:
        'Find Medicare facilities in a specific city, state, and zip code within a particular category.',
      params: ['city', 'state', 'zipCode', 'category']
    },
    {
      id: 'find-nearby-facilities',
      description: 'Find Medicare facilities nearby based on a given category.',
      params: ['category']
    },
    {
      id: 'search-facility',
      description: 'Search for a specific Medicare facility by its name.',
      params: ['facilityName']
    },
    {
      id: 'list-services',
      description: 'List the services provided by a specific Medicare facility.',
      params: ['facilityName']
    },
    {
      id: 'list-contact-info',
      description: 'List the contact information for a specific Medicare facility.',
      params: ['facilityName']
    },
    {
      id: 'list-facility-ratings',
      description: 'List the ratings of a specific Medicare facility.',
      params: ['facilityName']
    },
    {
      id: 'check-top-rated',
      description: 'Check if a specific Medicare facility is top-rated.',
      params: ['facilityName']
    },
    {
      id: 'locate-facility-on-map',
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

const CATEGORIES = ['nursing-homes', 'in-home-care', 'inpatient-rehabilitations', 'memory-care']

const CORE_PROMPTS = {
  task: [
    // {
    //   text: 'Strictly avoid using natural language. Only use JSON.'
    // },
    // {
    //   text: `Provide information and answer questions about specific supported categories of Medicaid and Medicare in the USA: ${CATEGORIES}.`
    // },
    // {
    //   text: 'Success is achieved when I correctly classify your query with its intent and relevance.'
    // },
    // {
    //   text: 'A query is considered a failure if it does not relate to Medicaid and Medicare in the USA or other supported categories.'
    // },
    // {
    //   text: 'Classify queries as relevant if they concern Medicaid and Medicare in the USA or fall within other specified categories.'
    // },
    // {
    //   text: 'Irrelevant queries are those that do not pertain to Medicaid and Medicare in the USA or other specified categories.'
    // },
    {
      text: `Identify intent and extract parameters from user input based on supported categories as: ${JSON.stringify(
        INTENTS
      )}`
    },
    {
      text: `Supported categories are: ${CATEGORIES}.`
    },
    {
      text: 'Standardize the following details: convert state names to 2-letter abbreviations, capitalize city names to official format, and format zip codes to the standard USA format.'
    },
    {
      text: `Do not include empty keys or missing parameters in response.`
    },
    {
      text: `Return response in JSON format as: ${JSON.stringify(RESPONSE_TEMPLATE)}`
    }
    // {
    //   text: 'Scope is focused exclusively on Info Senior Care data. Provide information related to Info Senior Care, nursing, hospitals, and health providers.'
    // },
    // {
    //   text: "Only share website links from Info Senior Care. Here's the link: https://infosenior.care/"
    // }
  ]
}

export const sendMessage = async (messages, context = {}) => {
  try {
    const model = GEN_AI.getGenerativeModel({ model: MODEL_NAME })

    const userMessages = messages.filter((message) => message.role === 'user')

    const promptHistory = Object.values(CORE_PROMPTS).flatMap((prompt) =>
      prompt.map((message) => ({ role: 'model', parts: [message] }))
    )

    console.log(context)
    const chat = model.startChat({
      history: promptHistory,
      GENERATION_CONFIG,
      SAFETY_SETTINGS,
      context
    })

    const recentMessage = userMessages[userMessages.length - 1].parts
    console.log(recentMessage)
    const result = await chat.sendMessage(recentMessage)
    const response = await result.response
    const reply = response.text()
    console.log(reply)
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
