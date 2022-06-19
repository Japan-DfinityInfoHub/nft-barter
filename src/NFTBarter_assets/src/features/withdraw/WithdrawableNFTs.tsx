import React, { FC } from 'react';
import {
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Text,
  Divider,
  Flex,
  Image,
  Box,
} from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import listChecklist from '@iconify/icons-ci/list-checklist';

import { useWithdrawableNfTs } from './useWithdrawableNFTs';
import { decodeTokenId } from '../../utils/ext';
import { GENERATIVE_ART_NFT_BASE_URL as baseUrl } from '../../utils/canisterId';
import { StatusBadge } from '../../Components/StatusBadge';
import { WithdrawButton } from './WithdrawButton';

export const WithdrawableNFTs = () => {
  const { withdrawableNfts } = useWithdrawableNfTs();

  return (
    <Box borderWidth='1px' borderRadius='lg'>
      <Flex px='20px' py='10px' alignItems='center'>
        <Icon icon={listChecklist} />
        <Text px='12px' fontSize='lg' color='gray.800'>
          List
        </Text>
      </Flex>
      <TableContainer>
        <Divider />
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>Image</Th>
              <Th>Collection</Th>
              <Th>ID</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody fontSize='sm' color='gray.500'>
            {withdrawableNfts.map((nft) => {
              const { tokenId, status } = nft;
              const { index } = decodeTokenId(tokenId);
              return (
                <Tr key={tokenId}>
                  <Td>
                    <Image
                      fit={'cover'}
                      maxHeight='50px'
                      maxWidth='50px'
                      width='100%'
                      alt={`${tokenId}`}
                      src={`${baseUrl}/?tokenid=${tokenId}`}
                    />
                  </Td>
                  <Td>GenerativeArtNFT</Td>
                  <Td>#{index}</Td>
                  <Td>
                    <StatusBadge status={status} />
                  </Td>
                  <Td>
                    <WithdrawButton nft={nft} />
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};
