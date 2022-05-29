import React, { useState } from 'react';
import { Button, Text } from '@chakra-ui/react';

import { useAppDispatch } from '../../app/hooks';
import { mint } from './mintSlice';

export const MintButton = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await dispatch(mint());
    setLoading(false);
  };

  return (
    <Button
      color='white'
      px='1em'
      fontSize='md'
      height='2.5em'
      bgGradient='linear(to-r, blue.300, green.200)'
      borderRadius='2xl'
      _hover={{ bgGradient: 'linear(to-r, blue.400, green.300)' }}
      disabled={loading}
      onClick={handleClick}
    >
      <Text fontWeight='semibold'>Mint</Text>
    </Button>
  );
};
