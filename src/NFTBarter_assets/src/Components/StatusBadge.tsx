import React, { FC } from 'react';
import { Flex, Text, Center, Box } from '@chakra-ui/react';

import { NftStatus } from '../models/NftModel';

type Props = {
  status: NftStatus;
};

export const StatusBadge: FC<Props> = ({ status }) => {
  let bgColor: string = 'gray.300';
  let text: string = '';

  if (status === 'exhibit') {
    bgColor = 'green.400';
    text = 'Exhibit';
  } else if (status === 'exhibitEnd') {
    bgColor = 'blue.400';
    text = 'ExhibitEnd';
  } else if (status === 'bidOffering') {
    bgColor = 'green.600';
    text = 'Offering';
  } else if (status === 'selected') {
    bgColor = 'blue.800';
    text = 'Selected';
  } else if (status === 'notSelected') {
    bgColor = 'blue.300';
    text = 'NotSelected';
  } else if (status === 'winning') {
    bgColor = 'green.800';
    text = 'Winning';
  }

  return (
    <Center
      color='white'
      px='1em'
      fontSize={{ base: 'sm', md: 'md' }}
      height='2em'
      borderRadius='xl'
      bgColor={bgColor}
      maxWidth='100px'
    >
      <Text fontWeight='semibold'>{text}</Text>
    </Center>
  );
};
