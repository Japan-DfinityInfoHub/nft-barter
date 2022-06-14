import React, { FC, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  useDisclosure,
  Button,
  Text,
} from '@chakra-ui/react';

import { useAppDispatch } from '../../app/hooks';
import { exhibit, reset } from './exhibitSlice';
import { updateNft } from '../nfts/nftsSlice';
import { ConfirmationModalContent } from '../../Components/ConfitmationModalContent';
import { ProgressModalContent } from './ProgressModalContent';

interface Props {
  tokenId: string;
  tokenIndex: number;
  baseUrl: string;
}

export const ExhibitButton: FC<Props> = ({ tokenId, tokenIndex, baseUrl }) => {
  const dispatch = useAppDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isProgress, setIsProgress] = useState(false);

  const handleClickExhibitButton = () => {
    onOpen();
  };

  const handleClickYesButton = async () => {
    dispatch(reset());
    setIsProgress(true);
    await dispatch(exhibit({ tokenId }));
    await new Promise((resolve) => setTimeout(resolve, 500));
    dispatch(updateNft({ tokenId, tokenIndex, status: 'exhibit' }));
    setIsProgress(false);
    onClose();
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
        {isProgress ? (
          <ProgressModalContent />
        ) : (
          <ConfirmationModalContent
            title='Do you wish to exhibit your NFT?'
            tokenId={tokenId}
            tokenIndex={tokenIndex}
            baseUrl={baseUrl}
            disabled={isProgress}
            onClick={handleClickYesButton}
            onClose={onClose}
          />
        )}
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
