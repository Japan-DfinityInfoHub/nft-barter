import React from 'react';
import { Button, Text } from '@chakra-ui/react';

import { useAppDispatch } from '../../app/hooks';

export const ExhibitButton = () => {
  const dispatch = useAppDispatch();

  return (
    <Button
      color='white'
      px='1em'
      fontSize={{ base: 'sm', md: 'md' }}
      height='2em'
      bgGradient='linear(to-r, blue.300, green.200)'
      borderRadius='xl'
      _hover={{ bgGradient: 'linear(to-r, blue.400, green.300)' }}
      onClick={async () => {}}
    >
      <Text fontWeight='semibold'>Exhibit</Text>
    </Button>
  );
};
