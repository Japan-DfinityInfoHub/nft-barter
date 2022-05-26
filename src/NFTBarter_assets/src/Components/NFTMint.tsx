import React from 'react';
import { Center, Button, Text } from '@chakra-ui/react';

export const NFTMint = () => {
  return (
    <>
      <Center h='80vh'>
        <Button
          color='white'
          px='1em'
          fontSize='md'
          height='2.5em'
          bgGradient='linear(to-r, blue.300, green.200)'
          borderRadius='2xl'
          _hover={{ bgGradient: 'linear(to-r, blue.400, green.300)' }}
          onClick={async () => {}}
        >
          <Text fontWeight='semibold'>Mint</Text>
        </Button>
      </Center>
    </>
  );
};
