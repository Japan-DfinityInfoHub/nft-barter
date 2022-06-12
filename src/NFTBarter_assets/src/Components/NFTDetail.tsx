import React, { FC } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

import {
  Button,
  Image,
  HStack,
  VStack,
  Text,
  Center,
  Spacer,
  useBreakpointValue,
} from '@chakra-ui/react';

import { selectIsLogin } from '../features/auth/authSlice';
import { decodeTokenId } from '../utils/ext';
import {
  GENERATIVE_ART_NFT_CANISTER_ID,
  GENERATIVE_ART_NFT_BASE_URL as baseUrl,
} from '../utils/canisterId';

// Features
import { useExhibitCanister } from '../features/exhibit/useExhibitCanister';

// Components
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
  const Stack = getStack();
  const { tokenId } = useParams();
  const isLogin = useAppSelector(selectIsLogin);

  if (tokenId === undefined) {
    return <NotFound />;
  }
  const { bearer, isYours, exhibitId, isExhibit } = useExhibitCanister({
    tokenId,
  });

  const { index, canisterId } = decodeTokenId(tokenId);
  // So far we only accept GenerativeArtNFT canister
  if (canisterId !== GENERATIVE_ART_NFT_CANISTER_ID) {
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
        <VStack
          alignItems={{ base: 'center', sm: 'flex-start' }}
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
    </>
  );
};
