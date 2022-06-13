import React, { FC } from 'react';
import {
  ModalHeader,
  ModalBody,
  ModalContent,
  Image,
  Spacer,
  VStack,
  ModalFooter,
  Button,
  Text,
  Box,
} from '@chakra-ui/react';

interface Props {
  title: string;
  tokenId: string;
  tokenIndex: number;
  baseUrl: string;
  onClick: () => void;
  onClose: () => void;
}

export const ConfirmationModalContent: FC<Props> = ({
  title,
  tokenId,
  tokenIndex,
  baseUrl,
  onClick,
  onClose,
}) => {
  return (
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
            {title}
          </Text>
        </VStack>
      </ModalBody>

      <ModalFooter justifyContent='center'>
        <Spacer />
        <Button
          color='white'
          bgGradient='linear(to-r, blue.300, green.200)'
          mr={3}
          onClick={onClick}
        >
          YES
        </Button>
        <Spacer />
        <Button onClick={onClose} color='white' bgColor='gray.300'>
          NO
        </Button>
        <Spacer />
      </ModalFooter>
    </ModalContent>
  );
};
