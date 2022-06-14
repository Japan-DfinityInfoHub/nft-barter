import React, { useEffect } from 'react';
import { Box, SimpleGrid } from '@chakra-ui/react';

import { GENERATIVE_ART_NFT_BASE_URL as baseUrl } from '../../utils/canisterId';
import { NFTCard } from '../../Components/NFTCard';
import { ExhibitButton } from '../exhibit/ExhibitButton';
import { StatusBadge } from '../../Components/StatusBadge';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import {
  fetchMyNFTsOnWallet,
  fetchNFTsOnChildCanister,
  selectAllNfts,
} from './nftsSlice';

// NFTs on user's wallet and child canisters.
export const MyNFTs = () => {
  const dispatch = useAppDispatch();
  const allNfts = useAppSelector(selectAllNfts);

  useEffect(() => {
    dispatch(fetchMyNFTsOnWallet());
    dispatch(fetchNFTsOnChildCanister());
  }, []);

  return (
    <Box mt='20px'>
      <SimpleGrid
        mx={{ base: '0px', md: '10px' }}
        spacing='10px'
        columns={{ base: 2, md: 3, lg: 4 }}
      >
        {allNfts
          .filter((nft) => {
            const { status } = nft;
            return (
              status !== 'bidOffered' &&
              status !== 'notSelected' &&
              status !== 'selected'
            );
          })
          .map((nft) => {
            const { tokenId, tokenIndex, status } = nft;
            return (
              <Box mx='auto' my='10px' key={tokenId}>
                <NFTCard
                  to={`/asset/${tokenId}`}
                  tokenId={tokenId}
                  status={status}
                  tokenIndex={tokenIndex}
                  baseUrl={baseUrl}
                >
                  <>
                    {status === 'wallet' ? (
                      <ExhibitButton
                        tokenId={tokenId}
                        tokenIndex={tokenIndex}
                        baseUrl={baseUrl}
                      />
                    ) : (
                      <StatusBadge status={status} />
                    )}
                  </>
                </NFTCard>
              </Box>
            );
          })}
      </SimpleGrid>
    </Box>
  );
};
