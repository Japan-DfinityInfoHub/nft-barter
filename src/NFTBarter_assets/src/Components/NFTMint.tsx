import React from 'react';
import { Center, Text, VStack } from '@chakra-ui/react';
import { useAppSelector } from '../app/hooks';

import { MintButton } from '../features/mint/MintButton';
import {
  selectTokenId,
  selectTokenIndex,
  selectError,
} from '../features/mint/mintSlice';

export const NFTMint = () => {
  const tokenId = useAppSelector(selectTokenId);
  const tokenIndex = useAppSelector(selectTokenIndex);
  const error = useAppSelector(selectError);

  return (
    <>
      <Center h='80vh'>
        <VStack>
          {tokenId && tokenIndex && (
            <Text>
              You minted #{tokenIndex} ({tokenId})
            </Text>
          )}
          {error && <Text>{error}</Text>}
          <MintButton />
        </VStack>
      </Center>
    </>
  );
};
