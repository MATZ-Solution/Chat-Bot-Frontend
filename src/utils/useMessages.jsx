import { createContext, useContext, useEffect, useState } from 'react'
import { useToast } from '@apideck/components'
import { sendMessage } from './sendMessage'

const ChatsContext = createContext({})

export function MessagesProvider({ children }) {
  const { addToast } = useToast()
  const [messages, setMessages] = useState([])
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false)
  const [context, setContext] = useState({})

  useEffect(() => {
    const initializeChat = () => {
      const welcomeMessage = {
        role: 'model',
        parts:
          'Hi, I am David, personalized assistant of Info Senior Care. Here to provide the best assistance! Ask me anything about our company, industry, or finding nursing cares. How can I help you?'
      }
      setMessages([welcomeMessage])
    }

    if (!messages?.length) {
      initializeChat()
    }
  }, [messages?.length, setMessages])

  const addMessage = async (parts) => {
    setIsLoadingAnswer(true)
    try {
      const newMessage = {
        role: 'user',
        parts
      }
      const newMessages = [...messages, newMessage]
      setMessages(newMessages)

      const { data } = await sendMessage(newMessages, context)
      const reply = data.choices[0].message

      setMessages((prevMessages) => [...prevMessages, { role: 'model', parts: reply }])
      setContext(data.context) // Update context with the new context from the response
    } catch (error) {
      addToast({ title: 'An error occurred', type: 'error' })
    } finally {
      setIsLoadingAnswer(false)
    }
  }

  return (
    <ChatsContext.Provider value={{ messages, addMessage, isLoadingAnswer }}>
      {children}
    </ChatsContext.Provider>
  )
}

export const useMessages = () => {
  return useContext(ChatsContext)
}
