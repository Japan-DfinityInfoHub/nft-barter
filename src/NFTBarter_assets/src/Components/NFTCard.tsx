import React, { FC } from 'react';
import { Link } from 'react-router-dom';
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
      <Link to={`/asset/${tokenId}`}>
        <Image
          fit={'cover'}
          width='100%'
          alt={`${tokenId}`}
          src={`${baseUrl}/?tokenid=${tokenId}`}
        />
      </Link>
      <HStack alignItems='center'>
        <Text
          p={{ base: 2, lg: 3 }}
          fontSize={{ base: 'xs', md: 'sm' }}
        >{`# ${tokenIndex}`}</Text>
        <Spacer />
        <Box p='10px'>
          <ExhibitButton
            tokenId={tokenId}
            tokenIndex={tokenIndex}
            baseUrl={baseUrl}
          />
        </Box>
      </HStack>
    </Box>
  );
};
