import React, { FC } from 'react';
import {
  ModalHeader,
  ModalBody,
  Modal,
  ModalOverlay,
  ModalContent,
  Image,
  Spacer,
  VStack,
  ModalFooter,
  useDisclosure,
  Button,
  Text,
  Box,
} from '@chakra-ui/react';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { exhibit, selectChildCanisterId } from './exhibitSlice';

interface Props {
  tokenId: string;
  tokenIndex: number;
  baseUrl: string;
}

export const ExhibitButton: FC<Props> = ({ tokenId, tokenIndex, baseUrl }) => {
  const dispatch = useAppDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const childCanisterId = useAppSelector(selectChildCanisterId);

  const handleClickExhibitButton = () => {
    onOpen();
  };

  const handleClickYesButton = async () => {
    await dispatch(exhibit({ tokenId }));
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent mx='4px'>
          <ModalHeader mx='auto'>Confirmation</ModalHeader>
          <ModalBody>
            <VStack>
              <Text fontSize='md'># {tokenIndex}</Text>
              <Box minWidth='150px' maxWidth='200px'>
                <Image
                  fit={'cover'}
                  width='100%'
                  alt={`${tokenId}`}
                  src={`${baseUrl}/?tokenid=${tokenId}`}
                />
              </Box>
              <Text fontSize='md' fontWeight='bold'>
                Do you wish to exhibit your NFT?
              </Text>
              {/* Just for test purpose */}
              <Text fontSize='md' fontWeight='bold'>
                {childCanisterId}
              </Text>
            </VStack>
          </ModalBody>

          <ModalFooter justifyContent='center'>
            <Button
              color='white'
              bgGradient='linear(to-r, blue.300, green.200)'
              mr={3}
              onClick={handleClickYesButton}
            >
              YES
            </Button>
            <Spacer />
            <Button onClick={onClose} color='white' bgColor='gray.300'>
              NO
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Button
        color='white'
        px='1em'
        fontSize={{ base: 'sm', md: 'md' }}
        height='2em'
        bgGradient='linear(to-r, blue.300, green.200)'
        borderRadius='xl'
        _hover={{ bgGradient: 'linear(to-r, blue.400, green.300)' }}
        onClick={handleClickExhibitButton}
      >
        <Text fontWeight='semibold'>Exhibit</Text>
      </Button>
    </>
  );
};
