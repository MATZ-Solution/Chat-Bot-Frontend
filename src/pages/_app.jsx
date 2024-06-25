import 'styles/globals.css'
import 'styles/tailwind.css'
import { ModalProvider, ToastProvider } from '@apideck/components'

import { ChakraProvider, extendTheme, ColorModeProvider } from '@chakra-ui/react'
import { AppProps } from 'next/app'

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false
  },
  fonts: {
    body: 'Inter, sans-serif',
    heading: 'Inter, sans-serif'
  }
})

export default function App({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <ToastProvider>
        <ModalProvider>
          <Component {...pageProps} />
        </ModalProvider>
      </ToastProvider>
    </ChakraProvider>
  )
}
