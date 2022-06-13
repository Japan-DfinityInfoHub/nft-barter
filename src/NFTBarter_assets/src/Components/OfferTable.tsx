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
  Box,
} from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import listChecklist from '@iconify/icons-ci/list-checklist';
import { Offer } from '../features/auction/auctionSlice';

type Props = {
  offers: Offer[];
};

export const OfferTable: FC<Props> = ({ offers }) => {
  return (
    <Box borderWidth='1px' borderRadius='lg'>
      <TableContainer>
        <Flex px='20px' py='10px' alignItems='center'>
          <Icon icon={listChecklist} />
          <Text px='12px' fontSize='lg' color='gray.800'>
            Offers
          </Text>
        </Flex>
        <Divider />
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>Collection</Th>
              <Th>ID</Th>
              <Th>From</Th>
            </Tr>
          </Thead>
          <Tbody fontSize='sm' color='gray.500'>
            {offers.map((offer) => {
              return (
                <Tr>
                  <Td>GenerativeArtNFT</Td>
                  <Td>{offer.bidTokenIndex}</Td>
                  <Td>{offer.bidChildCanister}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};
