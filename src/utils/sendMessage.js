import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const MODEL_NAME = 'gemini-1.0-pro'

let messageHistory = []

export const sendMessage = async (messages, context = {}) => {
  try {
    const genAI = new GoogleGenerativeAI('AIzaSyBP5NfEawwgY7BCLXbehd8w3cqoGdJ-OtY')
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })

    const generationConfig = {
      temperature: 0.5,
      topK: 90,
      topP: 0.1,
      maxOutputTokens: 2048
    }

    const safetySettings = [
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

    const recentUserMessage = messages.reduce((latest, message) => {
      if (message.role === 'user') {
        return message
      }
      return latest
    }, null)

    let userMessageContent = recentUserMessage ? recentUserMessage.parts : ''
    console.log('userMessageContent', userMessageContent)

    const nursingHomeKeywords = [
      'nursingHomenew',
      'inHomeCare',
      'inpatientrehabilitiations',
      'memoryCare'
    ]
    const keywordVariations = {
      nursingHomenew: ['nursing home', 'nursing home', 'home nursing'],
      inHomeCare: [
        'home care',
        'in home service',
        'inhome service care',
        'in home care',
        'in home care service'
      ],
      memoryCare: ['memory care', 'memory service', 'memory care service'],
      inpatientrehabilitiations: [
        'inpatientrehabilitiations service',
        'inpatientrehabilitiations care',
        'in patient rehabilitiations',
        'in patient rehabilitiations service',
        'in patient rehab care',
        'in patient rehab',
        'inpatient rehab',
        'patient rehab'
      ]
    }

    const matchKeywords = (messageContent, keywords) => {
      const normalizedMessage = messageContent.toLowerCase()
      for (const keyword of keywords) {
        if (normalizedMessage.includes(keyword.toLowerCase())) {
          return true
        }
      }
      return false
    }

    const collectionKeyword = nursingHomeKeywords.find((keyword) => {
      if (userMessageContent.toLowerCase().includes(keyword.toLowerCase())) {
        return true
      }
      if (keywordVariations[keyword]) {
        return matchKeywords(userMessageContent, keywordVariations[keyword])
      }
      return false
    })

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

    const zipCodeRegex = /\b(\d{5})\b/
    const cityRegex = /\b(?:city|cities)[^\S,]*([a-zA-Z\s]+)\b/i
    const stateRegex = /\b(?:state|states)[^\S,]*([a-zA-Z\s]+)\b/i
    const addressRegex = /\b(?:in|of|at)\s*address\s*(.*?)(?:\.$|$)/i

    const addressMatch = userMessageContent.match(addressRegex)
    const cityMatch = userMessageContent.match(cityRegex)
    const stateMatch = userMessageContent.match(stateRegex)
    const zipCodeMatch = userMessageContent.match(zipCodeRegex)

    const extractNameBeforeComma = (text) => {
      const commaIndex = text.indexOf(',')
      return commaIndex !== -1 ? text.substring(0, commaIndex).trim() : text.trim()
    }

    const isTopOrBestQuery = /top|best|rated|ratings|rating|highest|high|highly/i.test(
      userMessageContent
    )

    if (collectionKeyword) {
      if (
        cityMatch &&
        cityMatch[1] &&
        stateMatch &&
        stateMatch[1] &&
        zipCodeMatch &&
        zipCodeMatch[1]
      ) {
        const city = extractNameBeforeComma(cityMatch[1])
        const state = extractNameBeforeComma(stateMatch[1])
        const zipCode = extractNameBeforeComma(zipCodeMatch[1])
        const apiUrl = `https://info-senior-bot-backend.vercel.app/api/${collectionKeyword}/search?city=${encodeURIComponent(
          city
        )}&state=${encodeURIComponent(state)}&zipCode=${encodeURIComponent(zipCode)}${
          isTopOrBestQuery ? '?top=true' : ''
        }`
        const { data, newMessages } = await fetchDataAndFormatResponse(apiUrl, collectionKeyword)
        return { data, messages: newMessages || [] }
      } else if (addressMatch && addressMatch[1]) {
        const fullAddress = addressMatch[1].trim()
        const apiUrl = `https://info-senior-bot-backend.vercel.app/api/${collectionKeyword}/fullAddress?fullAddress=${encodeURIComponent(
          fullAddress
        )}${isTopOrBestQuery ? '?top=true' : ''}`
        const { data, newMessages } = await fetchDataAndFormatResponse(apiUrl, collectionKeyword)
        return { data, messages: newMessages || [] }
      } else if (cityMatch && cityMatch[1] && stateMatch && stateMatch[1]) {
        const city = extractNameBeforeComma(cityMatch[1])
        const state = extractNameBeforeComma(stateMatch[1])
        const apiUrl = `https://info-senior-bot-backend.vercel.app/api/${collectionKeyword}/city_state?city=${encodeURIComponent(
          city
        )}&state=${encodeURIComponent(state)}${isTopOrBestQuery ? '?top=true' : ''}`
        const { data, newMessages } = await fetchDataAndFormatResponse(apiUrl, collectionKeyword)
        return { data, messages: newMessages || [] }
      }
      // Check for city or zipCode matches
      else if (cityMatch && cityMatch[1]) {
        const city = cityMatch[1].trim()
        const apiUrl = `https://info-senior-bot-backend.vercel.app/api/${collectionKeyword}/city/${encodeURIComponent(
          city
        )}${isTopOrBestQuery ? '?top=true' : ''}`
        const { data, newMessages } = await fetchDataAndFormatResponse(apiUrl, collectionKeyword)
        return { data, messages: newMessages || [] }
      } else if (stateMatch && stateMatch[1]) {
        const state = stateMatch[1].trim()
        const apiUrl = `https://info-senior-bot-backend.vercel.app/api/${collectionKeyword}/state/${encodeURIComponent(
          state
        )}${isTopOrBestQuery ? '?top=true' : ''}`
        const { data, newMessages } = await fetchDataAndFormatResponse(apiUrl, collectionKeyword)
        return { data, messages: newMessages || [] }
      } else if (zipCodeMatch && zipCodeMatch[1]) {
        const zipCode = zipCodeMatch[1]?.trim()
        console.log('Zipcode:', zipCode)
        console.log('Istop:', isTopOrBestQuery)
        const apiUrl = `https://info-senior-bot-backend.vercel.app/api/${collectionKeyword}/zipCode/${encodeURIComponent(
          zipCode
        )}${isTopOrBestQuery ? '?top=true' : ''}`
        const { data, newMessages } = await fetchDataAndFormatResponse(apiUrl, collectionKeyword)
        return { data, messages: newMessages || [] }
      } else {
        const apiUrl = `https://info-senior-bot-backend.vercel.app/api/${collectionKeyword}${
          isTopOrBestQuery ? '?top=true' : ''
        }`
        const { data, newMessages } = await fetchDataAndFormatResponse(apiUrl, collectionKeyword)
        return { data, messages: newMessages || [] }
      }
    } else {
      const userMessages = messages.filter((message) => message.role === 'user')
      console.log('userMessages', userMessages)
      const prompts = {
        intro: [
          {
            text: "Hello! I'm David, your assistant from Info Senior Care. Trained by Info Senior Care, I'm here to offer you top-notch assistance. Feel free to ask me anything about our company, industry, or how I can assist you."
          }
        ],
        'company Info and overview': [
          {
            text: "At Info Senior Care, we're dedicated to connecting seniors and their families with a range of senior care facilities and in-home care services."
          },
          {
            text: 'Our mission is to ensure a seamless and compassionate experience, delivering the highest quality care for seniors in a nurturing environment.'
          },
          {
            text: "Vision Statement: We're committed to revolutionizing how technology serves humanity by empowering solutions that drive progress and prosperity, simplifying the search for senior care."
          },
          {
            text: 'For more details, visit our website: https://infosenior.care. Please note, we only provide information from this source.'
          }
        ],
        location: [
          {
            text: 'You can find Info Senior Care at 20 Eastbourne Terrace, London W2 6LG, London, UK.'
          }
        ],
        contact: [
          {
            text: 'For further inquiries, you can contact us via Email: info@senior.care or Phone: (+55) 654 - 545 - 5418 , (+55) 654 - 545 - 1235.'
          }
        ],
        'services offered': [
          {
            text: 'Explore our range of services including Nursing Homes, In-Home Care, Memory Care, and Patient Rehabilitation on our user-friendly website.'
          },
          {
            text: 'Our platform simplifies the process for you, providing a comprehensive database of senior care facilities and in-home care providers across the United States.'
          }
        ],
        screening: [
          {
            text: 'We also offer various screening tests to monitor your health, such as Diabetic, Elderly Nutritional, Stroke, Depressive, Elderly Fall, Cognitive Tests, and Frailty Screenings. Learn more at: https://infosenior.care/screening.php'
          }
        ],
        Instructions: [
          {
            text: "I'm sorry, but I'm trained solely on Info Senior Care data, so I can only provide information related to Info Senior Care, nursing, hospitals, and health providers."
          },
          {
            text: "Please note that I can only share website links from Info Senior Care. Here's the link for reference: https://infosenior.care/"
          },
          {
            text: "When providing health provider results, I'll present 5 results in the following format:\n\n   ** ${result.Name} **\n                  Details:\n                  City: ${result.city}\n                  Zip: ${result.zipCode}\n                  State: ${result.state}\n                  Address: ${result.fullAddress}\n               ratings\n        ----------------"
          }
        ]
      }

      console.log('messages:', messages)
      const promptMessages = Object.values(prompts).flatMap((prompt) =>
        prompt.map((message) => ({ role: 'model', parts: [message] }))
      )
      const historyWithPrompts = [
        ...promptMessages,
        ...messages.map((msg) => ({ role: msg.role, parts: [{ text: msg.parts }] }))
      ]

      const chat = model.startChat({
        history: historyWithPrompts,
        generationConfig,
        safetySettings,
        context
      })
      console.log('userMessages before send', userMessages)

      const result = await chat.sendMessage(userMessages[userMessages.length - 1].parts)
      const response = await result.response
      const reply = response.text()
      console.log('reply:', reply)
      const replyMessage = {
        role: 'model',
        parts: reply
      }
      console.log('replyMessage:', replyMessage)

      const updatedContext = response.context
      console.log('updatedContext:', updatedContext)

      const newMessages = [...messages, replyMessage]
      console.log('newMessages:', newMessages)

      return { data: { choices: [{ message: reply }], context: updatedContext } }
    }
  } catch (error) {
    console.error(error)
    return { data: { choices: [{ message: 'An error occurred' }] } }
  }
}
