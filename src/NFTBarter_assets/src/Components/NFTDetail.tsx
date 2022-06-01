import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Image,
  HStack,
  VStack,
  Text,
  Center,
  Spacer,
  useBreakpointValue,
} from '@chakra-ui/react';
import { decodeTokenId } from '../utils/ext';
import {
  GENERATIVE_ART_NFT_CANISTER_ID,
  GENERATIVE_ART_NFT_BASE_URL as baseUrl,
} from '../utils/canisterId';
import { NotFound } from './NotFound';
import { UserIcon } from './UserIcon';

const getStack = () => {
  const isMobile = useBreakpointValue({ base: true, sm: false });
  if (isMobile) {
    return VStack;
  } else {
    return HStack;
  }
};

export const NFTDetail = () => {
  const Stack = getStack();
  const { tokenId } = useParams();
  const { index, canisterId } = decodeTokenId(tokenId);

  // So far we only accept GenerativeArtNFT canister
  if (canisterId && canisterId !== GENERATIVE_ART_NFT_CANISTER_ID) {
    return <NotFound />;
  }

  return (
    <>
      <Stack
        maxW='1300px'
        mx='auto'
        alignItems={{ base: 'center', sm: 'flex-start' }}
      >
        <Center
          width={{ base: '100%', sm: '40%' }}
          borderRadius='lg'
          overflow='hidden'
          my={{ base: '20px', md: '40px' }}
          mx={{ base: '0px', sm: '20px' }}
        >
          <Image
            fit={'cover'}
            maxHeight='70vw'
            alt={`${tokenId}`}
            src={`${baseUrl}/?tokenid=${tokenId}`}
          />
        </Center>
        <VStack>
          <Text
            mx={{ base: '0px', md: '20px' }}
            mt={{ base: '20px', md: '40px' }}
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight='bold'
          >
            Generave Art NFT #{index}
          </Text>
        </VStack>
      </Stack>
    </>
  );
};
