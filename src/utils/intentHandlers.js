import { GEN_AI, MODEL_NAME, GENERATION_CONFIG, SAFETY_SETTINGS } from './model'

import { DOMAIN_SPECIFIC_INFO } from './knowledgeBank'

import { toTitleCase, normalizeState } from './helpers'

const BACKEND_URI = 'http://localhost:3000/api'

const handleCompanyInfo = async (userPrompt, _params) => {
  const info = DOMAIN_SPECIFIC_INFO.map((message) => ({ role: 'model', parts: [message] }))
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

const templatize = (json, index) => {
  var { name, fullAddress, city, state, zipCode, mainCategory: category } = json

  name = toTitleCase(name)
  fullAddress = toTitleCase(fullAddress)
  city = toTitleCase(city)
  state = toTitleCase(state)
  category = toTitleCase(category)

  return `
  <li class="py-1">
    <h2>${index + 1}. <b>${name}</b></h2>
    <ul class="pl-4">
      <li>
        <b>Address:</b> ${fullAddress}, ${city}, ${state} ${zipCode}
      </li>
      <li>
        <b>Category:</b> ${category}
      </li>
    </ul>
  </li>
  `
}

const handleFindFacilitiesByLocation = async (userPrompt, params) => {
  var query = ''

  if (params.state) {
    query += `state=${normalizeState(params.state)}&`
  }

  if (params.city) {
    query += `city=${toTitleCase(params.city)}&`
  }

  const request = `${BACKEND_URI}/${params.category}/fetch?${query}`
  const response = await fetch(request)
  const json = await response.json()
  const html = `
  I found ${json.length} records matching your query.
  ${json.length > 0 ? 'Here is the information you requested:' : ''}
  <ul>
    ${json.map(templatize).join('\n')}
  </ul>
  `
  return html
}

const handleMiscellaneous = () => {
  return "I'm sorry, I'm not equipped to handle that request at the moment. Is there anything else I can assist you with?"
}

const INTENT_HANDLES = {
  'company-info': handleCompanyInfo,
  'find-facilities-by-location': handleFindFacilitiesByLocation
}

module.exports = { INTENT_HANDLES, handleMiscellaneous }
