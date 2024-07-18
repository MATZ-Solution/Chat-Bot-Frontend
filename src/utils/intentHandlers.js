import { GEN_AI, MODEL_NAME, GENERATION_CONFIG, SAFETY_SETTINGS } from './model'

import { COMPANY_INFO, CHATBOT_INFO_AND_FEATURES } from './knowledgeBank'

import { toTitleCase, normalizeState, templatize, getLocation } from './helpers'

const BACKEND_URI = 'http://localhost:3000/api'

const handleCompanyInfo = async (userPrompt, _params) => {
  const info = COMPANY_INFO.map((message) => ({ role: 'model', parts: [message] }))
  const model = GEN_AI.getGenerativeModel({ model: MODEL_NAME })
  const chat = model.startChat({
    history: info,
    GENERATION_CONFIG,
    SAFETY_SETTINGS
  })
  const result = await chat.sendMessageStream(userPrompt)
  const response = await result.response
  const reply = response.text()
  return reply
}

const handleChatbotInfoAndFeatures = async (userPrompt, _params) => {
  const info = CHATBOT_INFO_AND_FEATURES.map((message) => ({ role: 'model', parts: [message] }))
  const model = GEN_AI.getGenerativeModel({ model: MODEL_NAME })
  const chat = model.startChat({
    history: info,
    GENERATION_CONFIG,
    SAFETY_SETTINGS
  })
  const result = await chat.sendMessageStream(userPrompt)
  const response = await result.response
  const reply = response.text()
  return reply
}

const handleFindFacilitiesByLocation = async (userPrompt, params) => {
  var query = ''

  if (params.state) {
    query += `state=${normalizeState(params.state)}&`
  }

  if (params.city) {
    query += `city=${toTitleCase(params.city)}&`
  }

  if (params.zipCode) {
    query += `zipCode=${params.zipCode}`
  }

  const request = `${BACKEND_URI}/${params.category}/fetch?${query}`
  const response = await fetch(request)
  const json = await response.json()
  const html = `
  I fetched the top ${json.length} records matching your query.
  ${json.length > 0 ? 'Here is the information you requested:' : ''}
  <ul>
    ${json.map(templatize).join('\n')}
  </ul>
  `
  return html
}

const handleNearbyFacilities = () => {
  return 'TO BE IMPLEMENTED: NEAR BY FACILITY'
}

const handleSearchFacility = async (userPrompt, params) => {
  return 'TO BE IMPLEMENTED: SEARCH FACILITY'
}

const handleMiscellaneous = () => {
  return "I'm sorry, I'm not equipped to handle that request at the moment. Is there anything else I can assist you with?"
}

const INTENT_HANDLES = {
  'company-info': handleCompanyInfo,
  'chatbot-info-and-features': handleChatbotInfoAndFeatures,
  'find-facilities-by-location': handleFindFacilitiesByLocation,
  'find-nearby-facilities': handleNearbyFacilities,
  'search-facility': handleSearchFacility
}

module.exports = { INTENT_HANDLES, handleMiscellaneous }
