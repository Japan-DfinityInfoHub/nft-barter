import React from 'react';
import { Button, Text } from '@chakra-ui/react';

import { useAppDispatch } from '../../app/hooks';
import { login } from './authSlice';

export const LoginButton = () => {
  const dispatch = useAppDispatch();

  return (
    <Button
      color='white'
      px='1em'
      fontSize='md'
      height='2.5em'
      bgGradient='linear(to-r, blue.300, green.200)'
      borderRadius='2xl'
      _hover={{ bgGradient: 'linear(to-r, blue.400, green.300)' }}
      onClick={async () => await dispatch(login())}
    >
      <Text fontWeight='semibold'>Login</Text>
    </Button>
  );
};
