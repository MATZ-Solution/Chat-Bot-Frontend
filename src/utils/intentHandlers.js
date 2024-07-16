import { GEN_AI, MODEL_NAME, GENERATION_CONFIG, SAFETY_SETTINGS } from './model'

import { DOMAIN_SPECIFIC_INFO } from './knowledgeBank'

import { STATES } from './states'

const BACKEND_URI = 'http://localhost:3000/api'

///////////////////////////////////

const fetchDataAndFormatResponse = async (apiUrl, collectionKeyword) => {
  try {
    const apiResponse = await fetch(apiUrl)
    const apiData = await apiResponse.json()
    if (apiData.length === 0) {
      return {
        data: {
          choices: [
            {
              message: "It seems like we couldn't find a match for your search in our records."
            }
          ]
        }
      }
    }
    if (Array.isArray(apiData)) {
      const formattedResults = apiData
        .map(
          (result, index) =>
            `
              **${index + 1}:-  ${result.name}**
              Details:
              City: ${result.city}
              Zip: ${result.zipCode}
              State: ${result.state}
              Address: ${result.fullAddress}
              ${isTopOrBestQuery ? `Ratings: ${result.scrapedAverageRating?.stars || ''}` : ''}
              ${
                isTopOrBestQuery
                  ? `Total Reviews: ${result.scrapedAverageRating?.reviewer_count || ''}`
                  : ''
              }
    ----------------
      `
        )
        .join('\n')
      const replyMessage = {
        role: 'model',
        parts: `Here are the details for ${collectionKeyword}: \n${formattedResults} `
      }
      const newMessages = [...messages, replyMessage]
      return {
        data: {
          choices: [
            {
              message: `Sure, These are the few top results: \n${formattedResults} `
            }
          ]
        }
      }
    } else {
      console.error('Invalid API response format')
      return {
        data: {
          choices: [
            {
              message: 'Error retrieving data from the server.'
            }
          ]
        }
      }
    }
  } catch (error) {
    console.error('Error fetching data from the server:', error)
    return {
      data: {
        choices: [
          {
            message: 'An error occurred while retrieving data from the server.'
          }
        ]
      }
    }
  }
}

///////////////////////////////////

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

const toTitleCase = (str) => {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  )
}

const normalizeState = (state) => {
  state = state.trim()
  return state.length === 2 ? STATES[state.toUpperCase()] : toTitleCase(state)
}

const handleFindFacilitiesByLocation = async (userPrompt, params) => {
  console.log(params)

  var query = ''

  if (params.state) {
    query += `state=${normalizeState(params.state)}&`
  }

  if (params.city) {
    query += `city=${toTitleCase(params.city)}&`
  }

  const request = `${BACKEND_URI}/${params.category}/fetch?${query}`
  console.log(request)
  const response = await fetch(request)
  const json = await response.json()

  return `Top ${json.length} ${toTitleCase(params.category)} fetched.`
}

const INTENT_HANDLES = {
  'company-info': handleCompanyInfo,
  'find-facilities-by-location': handleFindFacilitiesByLocation
}

module.exports = { INTENT_HANDLES }
