import React, { useEffect } from 'react';
import { Box, SimpleGrid, Center } from '@chakra-ui/react';

import { GENERATIVE_ART_NFT_BASE_URL as baseUrl } from '../../utils/canisterId';
import { NFTCard } from './../../Components/NFTCard';
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
