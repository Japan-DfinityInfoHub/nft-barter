import React, { useEffect } from 'react';
import { Box, SimpleGrid, Center } from '@chakra-ui/react';

import { GENERATIVE_ART_NFT_BASE_URL as baseUrl } from '../../utils/canisterId';
import { NFTCard } from './../../Components/NFTCard';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import {
  fetchNFTsOnWallet,
  fetchNFTsOnChildCanister,
  selectAllNfts,
} from './myGenerativeArtNFTSlice';

export const MyGenerativeArtNFTs = () => {
  const dispatch = useAppDispatch();
  const allNfts = useAppSelector(selectAllNfts);

  useEffect(() => {
    dispatch(fetchNFTsOnWallet());
    dispatch(fetchNFTsOnChildCanister());
  }, []);

  return (
    <Box maxW='1300px' mx='auto' mt='20px'>
      <SimpleGrid
        mx={{ base: '0px', md: '10px' }}
        spacing='10px'
        columns={{ base: 2, md: 3, lg: 4 }}
      >
        {allNfts.map((nft) => {
          const { tokenId, tokenIndex, status } = nft;
          return (
            <Box mx='auto' my='10px' key={tokenIndex}>
              <NFTCard
                tokenId={tokenId}
                status={status}
                tokenIndex={tokenIndex}
                baseUrl={baseUrl}
              />
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
};
