import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Image,
  Spacer,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useAppSelector } from '../app/hooks';

import { MintButton } from '../features/mint/MintButton';
import {
  selectTokenId,
  selectTokenIndex,
  selectError,
} from '../features/mint/mintSlice';
import { GENERATIVE_ART_NFT_BASE_URL as baseUrl } from '../utils/canisterId';

const getStack = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  if (isMobile) {
    return VStack;
  } else {
    return HStack;
  }
};

export const NFTMint = () => {
  const tokenId = useAppSelector(selectTokenId);
  const tokenIndex = useAppSelector(selectTokenIndex);
  const error = useAppSelector(selectError);
  const Stack = getStack();

  return (
    <>
      <Box
        w='100vw'
        position='relative'
        left='50%'
        minH='80vh'
        transform='translateX(-50%)'
        bgImage="url('/mint-page-background.svg')"
        bgRepeat='no-repeat'
        bgPosition='right top'
      >
        <Stack
          mx='auto'
          maxW='1300px'
          spacing={{ base: '30px', md: '40px' }}
          pt='40px'
        >
          <VStack
            alignItems={{ base: 'center', md: 'flex-start' }}
            textAlign={{ base: 'center', md: 'start' }}
            ml={{ base: '0px', md: '30px' }}
            maxW={{ base: '100%', md: '50%' }}
            spacing='30px'
          >
            <Text
              fontSize={{ base: 'xl', md: '4xl' }}
              fontWeight='bold'
              color='gray.600'
            >
              Get Sample NFT
            </Text>
            <Text
              fontSize={{ base: 'md', md: 'xl' }}
              color='gray.500'
              maxW='90%'
            >
              Mint an NFT to experience how it will be exchanged in this
              application. This is an EXT compliant NFT developed for
              demonstration purposes and will eventually be removed.
            </Text>
            <Spacer />
            <MintButton />
            {tokenIndex && (
              <Text
                fontSize={{ base: 'md', md: 'xl' }}
                color='blue.500'
                maxW='90%'
              >
                You successfully minted #{tokenIndex}!
              </Text>
            )}
          </VStack>
          <Box>
            {tokenIndex && (
              <Image
                maxHeight='340px'
                maxWidth={{ base: '90%', md: '340px' }}
                width='100%'
                fit={'cover'}
                boxShadow='xl'
                src={`${baseUrl}/?tokenid=${tokenId}`}
                alt={`${tokenId}`}
              />
            )}
          </Box>
        </Stack>
      </Box>
    </>
  );
};
