import { Button, Flex, Box, useColorMode, IconButton, Input } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useMessages } from 'utils/useMessages'
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa'
import { BsFillStopCircleFill } from 'react-icons/bs'
import { useToast } from '@apideck/components'

const MessageForm = () => {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const { addMessage } = useMessages()
  const { colorMode } = useColorMode()
  const [recognition, setRecognition] = useState(null)
  const { addToast } = useToast()

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      upgrade()
    } else {
      const speechRecognition = new webkitSpeechRecognition()
      speechRecognition.continuous = true
      speechRecognition.interimResults = true
      speechRecognition.lang = 'en-US'

      speechRecognition.onstart = () => setIsListening(true)
      speechRecognition.onend = () => setIsListening(false)
      speechRecognition.onresult = (event) => {
        let interimTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            setContent((prevContent) => prevContent + transcript)
          } else {
            interimTranscript += transcript
          }
        }
      }

      setRecognition(speechRecognition)
    }
  }, [])

  const upgrade = () => {
    addToast({
      title: 'Speech is not supported in this browser! Open Chrome for best experience!',
      type: 'error'
    })
  }

  const handleVoiceInput = () => {
    if (isListening) {
      recognition.stop()
    } else {
      recognition.start()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    setContent('')
    await addMessage(content)
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Flex
        bg={colorMode === 'dark' ? 'gray.800' : 'white'}
        p={4}
        borderTop="1px solid"
        borderColor="gray.200"
        align="center"
        boxShadow="md"
      >
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your message here..."
          size="md"
          resize="none"
          flex="1"
          mr={2}
          bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
          color={colorMode === 'dark' ? 'white' : 'black'}
        />
        <IconButton
          onClick={handleVoiceInput}
          icon={
            isListening ? <BsFillStopCircleFill fontSize={28} /> : <FaMicrophone fontSize={28} />
          }
          aria-label={isListening ? 'Stop Listening' : 'Start Listening'}
          mr={2}
          h={10}
          w={18}
        />
        <Button type="submit" colorScheme="blue" isLoading={isLoading} isDisabled={!content.trim()}>
          Send
        </Button>
      </Flex>
    </form>
  )
}

export default MessageForm
