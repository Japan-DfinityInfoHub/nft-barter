import React from 'react';
import { useParams } from 'react-router-dom';
import { Center } from '@chakra-ui/react';
import { decodeTokenId } from '../utils/ext';
import { NotFound } from './NotFound';
import { GENERATIVE_ART_NFT_CANISTER_ID } from '../utils/canisterId';

export const NFTDetail = () => {
  const params = useParams();
  const tokenId = params.tokenId;
  if (!tokenId) {
    return <NotFound />;
  }

  const { canisterId } = decodeTokenId(tokenId);

  // So far we only accept GenerativeArtNFT canister
  if (canisterId !== GENERATIVE_ART_NFT_CANISTER_ID) {
    return <NotFound />;
  }

  return <Center h='80vh'>{tokenId}</Center>;
};
