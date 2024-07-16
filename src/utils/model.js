import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const MODEL_NAME = 'gemini-1.0-pro'
const API_KEY = 'AIzaSyBP5NfEawwgY7BCLXbehd8w3cqoGdJ-OtY'
const GEN_AI = new GoogleGenerativeAI(API_KEY)

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

module.exports = { GEN_AI, MODEL_NAME, GENERATION_CONFIG, SAFETY_SETTINGS }
