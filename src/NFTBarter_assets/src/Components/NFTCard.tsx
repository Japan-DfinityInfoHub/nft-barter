import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Box, Image, Text, HStack, Spacer, Center } from '@chakra-ui/react';

import { ExhibitButton } from '../features/exhibit/ExhibitButton';
import { NftStatus } from '../features/myGenerativeArtNFT/myGenerativeArtNFTSlice';

interface Props {
  tokenId: string;
  tokenIndex: number;
  baseUrl: string;
  status: NftStatus;
}

export const NFTCard: FC<Props> = ({
  tokenId,
  tokenIndex,
  baseUrl,
  status,
}) => {
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
          {status === 'wallet' && (
            <ExhibitButton
              tokenId={tokenId}
              tokenIndex={tokenIndex}
              baseUrl={baseUrl}
            />
          )}
          {status === 'exhibit' && (
            <Center
              color='white'
              px='1em'
              fontSize={{ base: 'sm', md: 'md' }}
              height='2em'
              borderRadius='xl'
              bgColor='blue.300'
            >
              <Text fontWeight='semibold'>Exhibited</Text>
            </Center>
          )}
        </Box>
      </HStack>
    </Box>
  );
};
