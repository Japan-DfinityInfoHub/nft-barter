import React, { FC } from 'react';
import { Center, Text } from '@chakra-ui/react';

type Props = {
  title: string;
};

export const StatusBadge: FC<Props> = ({ title }) => {
  return (
    <Center
      color='white'
      px='1em'
      fontSize={{ base: 'sm', md: 'md' }}
      height='2em'
      borderRadius='xl'
      bgColor='blue.300'
    >
      <Text fontWeight='semibold'>{title}</Text>
    </Center>
  );
};
