import React from 'react';
import { useParams } from 'react-router-dom';
import { Center } from '@chakra-ui/react';

export const NFTDetail = () => {
  const params = useParams();
  const tokenId = params.tokenId;

  return <Center h='80vh'>{tokenId}</Center>;
};
