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

type Props = {};

export const OfferTable: FC<Props> = () => {
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
              <Th>No.</Th>
              <Th>From</Th>
            </Tr>
          </Thead>
          <Tbody fontSize='sm' color='gray.500'>
            <Tr>
              <Td>inches</Td>
              <Td>123</Td>
              <Td isNumeric>25.4</Td>
            </Tr>
            <Tr>
              <Td>feet</Td>
              <Td>123</Td>
              <Td isNumeric>30.48</Td>
            </Tr>
            <Tr>
              <Td>yards</Td>
              <Td>123</Td>
              <Td isNumeric>0.91444</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};
