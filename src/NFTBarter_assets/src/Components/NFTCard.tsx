import React, { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Box, Image, Text, HStack, Spacer } from '@chakra-ui/react';

import { NftStatus } from '../models/NftModel';

interface Props {
  to: string;
  tokenId: string;
  tokenIndex: number;
  baseUrl: string;
  status: NftStatus;
  children: ReactNode;
}

export const NFTCard: FC<Props> = ({
  tokenId,
  tokenIndex,
  baseUrl,
  to,
  children,
}) => {
  return (
    <Box
      minWidth='150px'
      maxWidth='200px'
      borderRadius='xl'
      borderWidth='1px'
      overflow='hidden'
    >
      <Link to={to}>
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
        <Box p='2'>{children}</Box>
      </HStack>
    </Box>
  );
};
