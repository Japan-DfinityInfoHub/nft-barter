import React, { FC } from 'react';
import { Box, Image, Text } from '@chakra-ui/react';

interface Props {
  tokenId: string;
  tokenIndex: number;
  baseUrl: string;
}

export const NFTCard: FC<Props> = ({ tokenId, tokenIndex, baseUrl }) => {
  return (
    <Box width='200px' borderRadius='xl' borderWidth='1px' overflow='hidden'>
      <Image
        fit={'cover'}
        width='100%'
        alt={`${tokenId}`}
        src={`${baseUrl}/?tokenid=${tokenId}`}
      />
      <Text
        p={{ base: 2, lg: 3 }}
        fontSize={{ base: 'xs', md: 'sm' }}
      >{`# ${tokenIndex}`}</Text>
    </Box>
  );
};
