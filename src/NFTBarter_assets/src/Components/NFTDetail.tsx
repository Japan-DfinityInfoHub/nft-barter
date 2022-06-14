import React, { FC, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

import {
  Box,
  Button,
  Image,
  HStack,
  VStack,
  Stack,
  Text,
  Center,
  Spacer,
} from '@chakra-ui/react';

import { selectIsLogin } from '../features/auth/authSlice';
import { decodeTokenId } from '../utils/ext';
import {
  GENERATIVE_ART_NFT_CANISTER_ID,
  GENERATIVE_ART_NFT_BASE_URL as baseUrl,
} from '../utils/canisterId';

// Features
import { useAuction } from '../features/auction/useAuction';

// Components
import { NotFound } from './NotFound';
import { UserIcon } from './UserIcon';
import { OfferTable } from './OfferTable';

type LinkToBidPageProp = {
  disabled: boolean;
  exhibitId?: string;
};
const LinkToBidPage: FC<LinkToBidPageProp> = ({ disabled, exhibitId }) => {
  if (disabled) {
    return <></>;
  }

  return (
    <Link to={`/bid/${exhibitId}`}>
      <Button
        color='white'
        borderRadius='full'
        bgColor='blue.300'
        _hover={{ bgColor: 'blue.500' }}
      >
        Place Bid
      </Button>
    </Link>
  );
};

export const NFTDetail = () => {
  const { tokenId } = useParams();
  const isLogin = useAppSelector(selectIsLogin);

  if (tokenId === undefined) {
    return <NotFound />;
  }
  const { bearer, isYours, exhibitId, isExhibit, offers } = useAuction(tokenId);
  const { index, canisterId } = decodeTokenId(tokenId);
  // So far we only accept GenerativeArtNFT canister
  if (canisterId !== GENERATIVE_ART_NFT_CANISTER_ID || !bearer) {
    return <NotFound />;
  }

  return (
    <>
      <Stack
        maxW='1300px'
        mx='auto'
        alignItems={{ base: 'center', md: 'flex-start' }}
        direction={{ base: 'column', md: 'row' }}
      >
        <Center
          width={{ base: '100%', sm: '40%' }}
          overflow='hidden'
          my={{ base: '20px', md: '40px' }}
          mx={{ base: '0px', sm: '20px' }}
        >
          <Image
            fit={'cover'}
            maxHeight='450px'
            maxWidth={{ base: '90%', md: '450px' }}
            width='100%'
            alt={`${tokenId}`}
            src={`${baseUrl}/?tokenid=${tokenId}`}
          />
        </Center>
        <VStack
          alignItems={{ base: 'center', md: 'flex-start' }}
          mx={{ base: '0px', md: '20px' }}
          spacing={{ base: '10px', md: '20px' }}
        >
          <Text
            mt={{ base: '20px', md: '40px' }}
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight='bold'
          >
            Generave Art NFT #{index}
          </Text>
          <Spacer />
          <HStack
            fontSize={{ base: 'lg', md: 'xl' }}
            alignItems='stretch'
            spacing='12px'
          >
            <Text color='gray.400'>Owned by {isYours && 'you'}</Text>
            <UserIcon diameter={28} accountId={bearer} />
            <Text color='blue.400'>{bearer.slice(0, 8)}...</Text>
          </HStack>
          <LinkToBidPage
            disabled={!isLogin || !isExhibit || isYours}
            exhibitId={exhibitId}
          />
        </VStack>
      </Stack>
      {isExhibit && (
        <Box p='20px'>
          <OfferTable tokenId={tokenId} />
        </Box>
      )}
    </>
  );
};
