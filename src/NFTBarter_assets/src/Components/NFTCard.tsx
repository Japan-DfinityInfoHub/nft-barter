import React, { FC } from 'react';
import { Box, Image, Text, HStack, Spacer } from '@chakra-ui/react';

import { ExhibitButton } from '../features/exhibit/ExhibitButton';

interface Props {
  tokenId: string;
  tokenIndex: number;
  baseUrl: string;
}

export const NFTCard: FC<Props> = ({ tokenId, tokenIndex, baseUrl }) => {
  return (
    <Box
      minWidth='150px'
      maxWidth='200px'
      borderRadius='xl'
      borderWidth='1px'
      overflow='hidden'
    >
      <Image
        fit={'cover'}
        width='100%'
        alt={`${tokenId}`}
        src={`${baseUrl}/?tokenid=${tokenId}`}
      />
      <HStack alignItems='center'>
        <Text
          p={{ base: 2, lg: 3 }}
          fontSize={{ base: 'xs', md: 'sm' }}
        >{`# ${tokenIndex}`}</Text>
        <Spacer />
        <Box p='10px'>
          <ExhibitButton />
        </Box>
      </HStack>
    </Box>
  );
};
