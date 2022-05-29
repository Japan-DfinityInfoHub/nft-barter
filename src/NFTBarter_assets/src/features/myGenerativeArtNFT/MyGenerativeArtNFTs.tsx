import React, { useEffect } from 'react';
import { Box, SimpleGrid, Center } from '@chakra-ui/react';

import { NFTCard } from './../../Components/NFTCard';

const baseUrl =
  process.env.DFX_NETWORK === 'ic' || !process.env.LOCAL_NFT_CANISTER_ID
    ? 'http://REPLACE_TO_CANISTER_ID.ic0.app'
    : `http://${process.env.LOCAL_NFT_CANISTER_ID}.localhost:8000`;

import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { fetchNFTs, selectNfts } from './myGenerativeArtNFTSlice';

export const MyGenerativeArtNFTs = () => {
  const dispatch = useAppDispatch();
  const nfts = useAppSelector(selectNfts);

  useEffect(() => {
    dispatch(fetchNFTs());
  }, []);

  return (
    <Box maxW='1300px' mx='auto' mt='20px'>
      <SimpleGrid mx='10px' spacing='10px' columns={{ base: 2, md: 3, lg: 4 }}>
        {nfts.map((nft) => {
          const { tokenId, tokenIndex } = nft;
          return (
            <Center my='10px'>
              <NFTCard
                key={tokenIndex}
                tokenId={tokenId}
                tokenIndex={tokenIndex}
                baseUrl={baseUrl}
              />
            </Center>
          );
        })}
      </SimpleGrid>
    </Box>
  );
};
