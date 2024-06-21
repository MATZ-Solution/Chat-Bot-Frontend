import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import { Box, Flex, Heading, Text, Icon, Image, Link, Spinner, useToast, Table, Thead, Tr, Th, Tbody } from '@chakra-ui/react';
import { AiOutlineHome, AiOutlineInfoCircle, AiOutlineMail } from 'react-icons/ai';

const Layout = ({
  children,
  title = 'Info Senior Care Bot',
  description = 'Info Senior Care Bot',
  favicon = 'https://infosenior.care/img/simplelogo.svg',
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();
  return (
    <Box className="bg-gray-100 font-sans leading-relaxed tracking-wide text-gray-800 antialiased">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="icon" href={favicon} />
      </Head>
      <Flex as="nav" bg="gray.50" borderBottomColor="gray.200" position="fixed" w="full" justifyContent="center" p={2} zIndex="banner">
        <Image src="https://matzsolutions.com/wp-content/uploads/2022/08/Artboard-%E2%80%93-3-1.png" h="12" alt=" INFO SENIOR Care Logo" />

      </Flex>
      <Flex as="main" flex="1" px="12" py="12" pt="20">
        {children}
      </Flex>
    </Box>
  );
};

export default Layout;