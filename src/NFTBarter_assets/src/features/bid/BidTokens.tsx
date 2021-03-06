import React, { FC, useEffect } from 'react';
import { Box, SimpleGrid } from '@chakra-ui/react';

import { GENERATIVE_ART_NFT_BASE_URL as baseUrl } from '../../utils/canisterId';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { NFTCard } from '../../Components/NFTCard';
import { fetchMyNFTsOnWallet, selectNftsOnWallet } from '../nfts/nftsSlice';
import { BidButton } from './BidButton';

type Props = {
  exhibitCanisterId: string;
  exhibitTokenIndex: number;
};

export const BidTokens: FC<Props> = ({
  exhibitCanisterId,
  exhibitTokenIndex,
}) => {
  const dispatch = useAppDispatch();
  const allNfts = useAppSelector(selectNftsOnWallet);

  useEffect(() => {
    dispatch(fetchMyNFTsOnWallet());
  }, []);

  return (
    <Box m='20px'>
      <SimpleGrid
        mx={{ base: '0px', md: '10px' }}
        spacing='10px'
        columns={{ base: 2, md: 3, lg: 4 }}
      >
        {allNfts
          .filter((nft) => nft.status === 'wallet')
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
                  <BidButton
                    bidTokenId={tokenId}
                    exhibitCanisterId={exhibitCanisterId}
                    exhibitTokenIndex={exhibitTokenIndex}
                    tokenIndex={tokenIndex}
                    baseUrl={baseUrl}
                  />
                </NFTCard>
              </Box>
            );
          })}
      </SimpleGrid>
    </Box>
  );
};
