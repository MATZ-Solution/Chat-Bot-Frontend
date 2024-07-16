import { CATEGORIES } from './knowledgeBank'
import { INTENTS } from './intents'

const RESPONSE_TEMPLATE = {
  intent: '<intent>',
  params: {}
}

const CORE_PROMPTS = {
  task: [
    {
      text: 'Strictly avoid using natural language. Only use JSON.'
    },
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
      text: `Return response in JSON format as: ${JSON.stringify(RESPONSE_TEMPLATE)}`
    }
  ]
}

module.exports = { CORE_PROMPTS }
