import React, { useEffect, useRef } from 'react'
import { useMessages } from 'utils/useMessages'
import { Box, Flex, Avatar, Text, Spinner, useColorMode } from '@chakra-ui/react'

const MessagesList = () => {
  const { messages, isLoadingAnswer } = useMessages()
  const { colorMode } = useColorMode()
  const bottomRef = useRef(null)

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoadingAnswer])

  const parseText = (text) => {
    const lines = text.split('\n')

    return lines.map((line, index) => {
      const boldBulletRegex = /\* \*\*(.*?)\*\*/
      const boldTextRegex = /\*\*(.*?)\*\*/
      const numberedBulletRegex = /^(\d+)\.\s/

      let parts = []
      let lastIndex = 0

      // Check for * ** and apply bold formatting
      let match = line.match(boldBulletRegex)
      while (match) {
        const [fullMatch, content] = match
        parts.push(line.substring(lastIndex, match.index))
        parts.push(<i key={index}>{content}</i>)
        lastIndex = match.index + fullMatch.length
        match = line.substring(lastIndex).match(boldBulletRegex)
      }
      parts.push(line.substring(lastIndex))

      // Check for ** and apply bold formatting
      parts = parts.flatMap((part, innerIndex) => {
        if (typeof part === 'string') {
          const match = part.match(boldTextRegex)
          if (match) {
            const [fullMatch, content] = match
            return [
              part.substring(0, match.index),
              <strong key={index + innerIndex}>{content}</strong>,
              part.substring(match.index + fullMatch.length)
            ]
          }
        }
        return part
      })

      // Check for numbered bullets and maintain numbering
      // const numberedMatch = line.match(numberedBulletRegex);
      // if (numberedMatch) {
      //   const number = numberedMatch[1];
      //   parts = [<span key={index}>{number}. </span>, ...parts.slice(1)];
      // }

      return <p key={index}>{parts}</p>
    })
  }

  return (
    <Box
      bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}
      p={4}
      flex="1"
      overflowY="auto"
      maxHeight="70vh"
    >
      {messages?.map((message, i) => {
        const isUser = message.role === 'user'
        return (
          <Flex key={`message-${i}`} mb={4} justify={isUser ? 'flex-end' : 'flex-start'}>
            {!isUser && <Avatar src="/img/ai.png" mr={2} />}
            <Box
              bg={isUser ? 'blue.500' : 'gray.200'}
              color={isUser ? 'white' : 'gray.800'}
              p={3}
              borderRadius="md"
              maxWidth="70%"
            >
              {parseText(message.parts)}
            </Box>
            {isUser && <Avatar src="/img/user.png" ml={2} />}
          </Flex>
        )
      })}
      {isLoadingAnswer && (
        <Flex justify="flex-end" mt={2} mb={4}>
          <div className="flex items-center">
            <Spinner size="sm" />
            <Text ml={2}>David is thinking...</Text>
          </div>
        </Flex>
      )}
      <div ref={bottomRef} />
    </Box>
  )
}

export default MessagesList
