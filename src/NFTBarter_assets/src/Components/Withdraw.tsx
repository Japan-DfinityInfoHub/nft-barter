import React from 'react';
import { Box } from '@chakra-ui/react';
import { WithdrawableNFTs } from '../features/withdraw/WithdrawableNFTs';

export const Withdraw = () => {
  return (
    <Box m='20px'>
      <WithdrawableNFTs />
    </Box>
  );
};
