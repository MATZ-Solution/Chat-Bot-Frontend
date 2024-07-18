import { GEN_AI, MODEL_NAME, GENERATION_CONFIG, SAFETY_SETTINGS } from './model'

import { CORE_PROMPTS } from './prompts'
import { INTENT_HANDLES, handleMiscellaneous } from './intentHandlers'

export const sendMessage = async (messages, context = {}) => {
  try {
    const model = GEN_AI.getGenerativeModel({ model: MODEL_NAME })

    const promptMessages = Object.values(CORE_PROMPTS).flatMap((prompt) =>
      prompt.map((message) => ({ role: 'model', parts: [message] }))
    )
    const userMessages = messages.filter((message) => message.role === 'user')

    const chat = model.startChat({
      history: promptMessages,
      GENERATION_CONFIG,
      SAFETY_SETTINGS,
      context
    })

    const recentMessage = userMessages[userMessages.length - 1].parts
    const result = await chat.sendMessageStream(recentMessage)
    const response = await result.response
    let reply = response.text()

    try {
      const parsedJSON = JSON.parse(reply)
      console.log(parsedJSON.intent, reply)
      reply = await INTENT_HANDLES[parsedJSON.intent](recentMessage, parsedJSON.params)
    } catch (e) {
      reply = handleMiscellaneous()
    }

    const replyMessage = {
      role: 'model',
      parts: reply
    }
    const updatedContext = response.context
    return { data: { choices: [{ message: reply }], context: updatedContext } }
  } catch (error) {
    console.error(error)
    return {
      data: {
        choices: [{ message: 'An unexpected error occurred. Please rephrase your request.' }]
      }
    }
  }
}
