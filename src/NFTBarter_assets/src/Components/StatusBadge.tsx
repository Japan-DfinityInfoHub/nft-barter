import React, { FC } from 'react';
import { Text, Center } from '@chakra-ui/react';

import { NftStatus } from '../models/NftModel';

type Props = {
  status: NftStatus;
};

export const StatusBadge: FC<Props> = ({ status }) => {
  let bgColor: string = 'gray.300';
  let text: string = '';

  if (status === 'exhibit') {
    bgColor = 'green.400';
    text = 'Waiting';
  } else if (status === 'exhibitEnd') {
    bgColor = 'blue.200';
    text = 'ExhibitEnd';
  } else if (status === 'bidOffering') {
    bgColor = 'green.400';
    text = 'Offering';
  } else if (status === 'bidOffered') {
    bgColor = 'green.400';
    text = 'Offered';
  } else if (status === 'selected') {
    bgColor = 'blue.400';
    text = 'Selected';
  } else if (status === 'notSelected') {
    bgColor = 'blue.200';
    text = 'NotSelected';
  } else if (status === 'winning') {
    bgColor = 'blue.400';
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
