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
import { Offer } from '../features/auction/auctionSlice';
import { GENERATIVE_ART_NFT_BASE_URL as baseUrl } from '../utils/canisterId';
import { decodeTokenId } from '../utils/ext';
import { SelectButton } from '../features/select/SelectButton';
import { useAuction } from '../features/auction/useAuction';

type Props = {
  tokenId: string;
};

export const OfferTable: FC<Props> = ({ tokenId }) => {
  const { isYours, exhibitId, offers } = useAuction(tokenId);

  const { index: exhibitTokenindex, canisterId: exhibitCanisterId } =
    decodeTokenId(exhibitId);

  return (
    <Box borderWidth='1px' borderRadius='lg'>
      <Flex px='20px' py='10px' alignItems='center'>
        <Icon icon={listChecklist} />
        <Text px='12px' fontSize='lg' color='gray.800'>
          Offers
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
              <Th>From</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody fontSize='sm' color='gray.500'>
            {offers !== undefined &&
              offers.map((offer) => {
                const {
                  bidTokenIndex,
                  tokenId,
                  bidChildCanisterAid,
                  nftStatus,
                } = offer;
                const { index } = decodeTokenId(tokenId);
                return (
                  <Tr key={offer.tokenId}>
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
                      <Text>{bidChildCanisterAid.slice(0, 8)}...</Text>
                    </Td>
                    <Td>
                      {nftStatus === 'notSelected' && <Text>Not Selected</Text>}
                      {nftStatus === 'selected' && <Text>Selected</Text>}
                      {nftStatus === 'bidOffered' && isYours && (
                        <SelectButton
                          exhibitCanisterId={exhibitCanisterId}
                          selectedTokenIndex={bidTokenIndex}
                          exhibitTokenIndex={exhibitTokenindex}
                          tokenId={tokenId}
                          baseUrl={baseUrl}
                          tokenIndex={index}
                        />
                      )}
                      {nftStatus === 'bidOffered' && !isYours && (
                        <Text>Offered</Text>
                      )}
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
