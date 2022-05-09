import React, { FC } from 'react';

import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { decrement, increment, selectCount } from './counterSlice';

import { Center, HStack, Button, Text } from '@chakra-ui/react';

export const Counter: FC = () => {
  const count = useAppSelector(selectCount);
  const dispatch = useAppDispatch();

  return (
    <Center h='200px'>
      <HStack spacing='10'>
        <Button
          aria-label='Decrement value'
          onClick={() => dispatch(decrement())}
        >
          -
        </Button>
        <Text>{count}</Text>
        <Button
          aria-label='Increment value'
          onClick={() => dispatch(increment())}
        >
          +
        </Button>
      </HStack>
    </Center>
  );
};
