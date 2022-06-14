import React, { FC, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  useDisclosure,
  Button,
  Text,
} from '@chakra-ui/react';

import { useAppDispatch } from '../../app/hooks';

import { handleClickSelect } from './selectSlice';

import { ConfirmationModalContent } from '../../Components/ConfitmationModalContent';

type Props = {
  exhibitCanisterId: string;
  selectedTokenIndex: number;
  exhibitTokenIndex: number;
  tokenId: string;
  tokenIndex: number;
  baseUrl: string;
};

export const SelectButton: FC<Props> = ({
  exhibitCanisterId,
  selectedTokenIndex,
  exhibitTokenIndex,
  tokenId,
  tokenIndex,
  baseUrl,
}) => {
  const dispatch = useAppDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isProgress, setIsProgress] = useState(false);

  const handleClickSelectButton = () => {
    onOpen();
  };

  const handleClickYesButton = async () => {
    setIsProgress(true);
    await dispatch(
      handleClickSelect({
        exhibitCanisterId,
        selectedTokenIndex,
        exhibitTokenIndex,
      })
    );
    onClose();
    setIsProgress(false);
  };

  return (
    <>
      <Modal
        closeOnOverlayClick={!isProgress}
        isOpen={isOpen}
        onClose={onClose}
        size='2xl'
      >
        <ModalOverlay />
        <ConfirmationModalContent
          title='Do you wish to select this NFT?'
          tokenId={tokenId}
          tokenIndex={tokenIndex}
          baseUrl={baseUrl}
          onClick={handleClickYesButton}
          onClose={onClose}
          disabled={isProgress}
        />
      </Modal>

      <Button
        color='white'
        px='1em'
        fontSize={{ base: 'sm', md: 'md' }}
        height='2em'
        bgGradient='linear(to-r, blue.300, green.200)'
        borderRadius='xl'
        _hover={{ bgGradient: 'linear(to-r, blue.400, green.300)' }}
        onClick={handleClickSelectButton}
      >
        <Text fontWeight='semibold'>Select</Text>
      </Button>
    </>
  );
};
