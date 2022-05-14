import React from 'react';
import { Image, Box, HStack, Text } from '@chakra-ui/react';

export const Footer = () => {
  return (
    <Box as='footer' bg='gray.100'>
      <Box maxW='1300px' mx='auto'>
        <HStack ml={{ base: '4', sm: '3' }} py='4' spacing='10px'>
          <Box>
            <Image height={'40px'} alt='Brand logo' src={`/brand-logo.svg`} />
          </Box>
          <Box>
            <Image height={'20px'} alt='Brand logo' src={`/brand-name.svg`} />
          </Box>
        </HStack>
        <Box
          as='ul'
          fontSize='sm'
          textAlign='right'
          style={{ listStyle: 'none' }}
          mx={{ base: '4', sm: '3' }}
          pb='4'
        >
          <Text as='li'>Privacy Policy</Text>
          <Text as='li'>Term of Service</Text>
          <Text as='li' mt='4'>
            Copyright(C) 2022, Dfinity JP
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
