import React, { FC, useState } from 'react';
import { Button, Text } from '@chakra-ui/react';

import { useAppDispatch } from '../../app/hooks';
import { withdrawNft } from './withdrawSlice';
import { NftOnChildCanisters } from '../../models/NftModel';

type Props = {
  nft: NftOnChildCanisters;
};

export const WithdrawButton: FC<Props> = ({ nft }) => {
  const dispatch = useAppDispatch();
  const [isProgress, setIsProgress] = useState(false);
  const { childCanisterId, tokenIndexOnChildCanister, tokenId } = nft;

  const handleClick = async () => {
    setIsProgress(true);
    await dispatch(
      withdrawNft({
        childCanisterId,
        tokenIndexOnChildCanister,
        tokenId,
      })
    );
    setIsProgress(false);
  };

  return (
    <>
      <Button
        color='white'
        px='1em'
        fontSize={{ base: 'sm', md: 'md' }}
        height='2em'
        bgGradient='linear(to-r, blue.300, green.200)'
        borderRadius='xl'
        disabled={isProgress}
        _hover={{ bgGradient: 'linear(to-r, blue.400, green.300)' }}
        onClick={handleClick}
      >
        <Text fontWeight='semibold'>Withdraw</Text>
      </Button>
    </>
  );
};
