import React from 'react';
import { Center, Text } from '@chakra-ui/react';

export const Exhibited = () => {
  return (
    <Center
      color='white'
      px='1em'
      fontSize={{ base: 'sm', md: 'md' }}
      height='2em'
      borderRadius='xl'
      bgColor='blue.300'
    >
      <Text fontWeight='semibold'>Exhibited</Text>
    </Center>
  );
};
