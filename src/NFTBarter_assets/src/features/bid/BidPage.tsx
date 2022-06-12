import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Text, VStack, Image } from '@chakra-ui/react';

import { GENERATIVE_ART_NFT_BASE_URL as baseUrl } from '../../utils/canisterId';
import { decodeTokenId } from '../../utils/ext';
import { getTokenIdAndNftStatusFromAsset } from '../../utils/nft';
import { createActor } from '../../../../declarations/ChildCanister';

import { BidTokens } from './BidTokens';
import { NotFound } from '../../Components/NotFound';

export const BidPage = () => {
  // `exhibitId` is constructed by canister ID of exhibit child canister and token index,
  // in the same manner as an EXT token identifier.
  const { exhibitId } = useParams();
  const { index, canisterId } = decodeTokenId(exhibitId);

  const [tokenId, setTokenId] = useState('');

  if (canisterId === '' || exhibitId === undefined) {
    return <NotFound />;
  }

  const fetchToken = async () => {
    const actor = createActor(canisterId);
    const res = await actor.getAssetByTokenIndex(BigInt(index));
    if ('ok' in res) {
      const nftStatus = res.ok;
      const nft = getTokenIdAndNftStatusFromAsset([BigInt(index), nftStatus]);
      setTokenId(nft.tokenId);
    }
  };

  useEffect(() => {
    fetchToken();
  }, []);

  return (
    <>
      <VStack>
        <Text pt='20px' fontSize='2xl' fontWeight='bold' color='gray.600'>
          Offer will be placed for ...
        </Text>
        <Text fontSize='lg' fontWeight='bold' color='gray.600'>
          # {index}
        </Text>
        <Box minWidth='150px' maxWidth='200px'>
          <Image
            fit={'cover'}
            width='100%'
            alt={`${tokenId}`}
            src={`${baseUrl}/?tokenid=${tokenId}`}
          />
        </Box>

        <Text p='10px' fontSize='xl' fontWeight='bold' color='gray.600'>
          Select yur NFT for a bid
        </Text>
      </VStack>

      <BidTokens exhibitCanisterId={canisterId} exhibitTokenIndex={index} />
    </>
  );
};
