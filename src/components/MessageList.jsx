import React, { useEffect, useRef } from 'react'

import { Box, Flex, Avatar, Text, Spinner, useColorMode, Mark } from '@chakra-ui/react'

import { useMessages } from 'utils/useMessages'

import { marked } from 'marked'

function convertMarkdownToHtml(markdownString) {
  const htmlString = marked(markdownString)
  return htmlString
}

const MessagesList = () => {
  const { messages, isLoadingAnswer } = useMessages()

  const { colorMode } = useColorMode()

  const bottomRef = useRef(null)
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoadingAnswer])

  return (
    <Box
      bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}
      color="neutral.100"
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
              <div dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(message.parts) }}></div>
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
