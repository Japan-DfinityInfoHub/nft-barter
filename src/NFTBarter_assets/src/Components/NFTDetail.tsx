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
  const params = useParams();
  const tokenId = params.tokenId;
  if (!tokenId) {
    return <NotFound />;
  }

  const { index, canisterId } = decodeTokenId(tokenId);

  // So far we only accept GenerativeArtNFT canister
  if (canisterId !== GENERATIVE_ART_NFT_CANISTER_ID) {
    return <NotFound />;
  }

  const Stack = getStack();

  return (
    <>
      <Stack maxW='1300px' mx='auto' alignItems='flex-start'>
        <Center
          width={{ base: '100%', sm: '40%' }}
          borderRadius='lg'
          overflow='hidden'
          my={{ base: '20px', md: '40px' }}
          mx={{ base: '0px', sm: '20px', md: '40px' }}
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
            ml={{ base: '10vw', sm: '0px', md: '20px' }}
            mt={{ base: '10px', sm: '20px', md: '40px' }}
            fontSize={{ base: 'xl', sm: '2xl', md: '4xl' }}
            fontWeight='bold'
          >
            Generave Art NFT #{index}
          </Text>
          <Spacer />
        </VStack>
      </Stack>
    </>
  );
};
