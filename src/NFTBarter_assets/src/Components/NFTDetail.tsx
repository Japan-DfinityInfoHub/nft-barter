import React from 'react';
import { useParams } from 'react-router-dom';
import { Center } from '@chakra-ui/react';
import { decodeTokenId } from '../utils/ext';
import { NotFound } from './NotFound';

const CANISTER_ID =
  process.env.DFX_NETWORK === 'ic' || !process.env.LOCAL_NFT_CANISTER_ID
    ? 'REPLACE_TO_CANISTER_ID'
    : process.env.LOCAL_NFT_CANISTER_ID;

export const NFTDetail = () => {
  const params = useParams();
  const tokenId = params.tokenId;
  if (!tokenId) {
    return <NotFound />;
  }

  const { canisterId } = decodeTokenId(tokenId);

  // So far we only accept GenerativeArtNFT canister
  if (canisterId !== CANISTER_ID) {
    return <NotFound />;
  }

  return <Center h='80vh'>{tokenId}</Center>;
};
