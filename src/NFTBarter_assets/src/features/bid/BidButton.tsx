import React, { FC, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  useDisclosure,
  Button,
  Text,
} from '@chakra-ui/react';

import { useAppDispatch } from '../../app/hooks';
import { offerBid, reset } from './bidSlice';
// import { updateNft } from '../myGenerativeArtNFT/myGenerativeArtNFTSlice';
import { ConfirmationModalContent } from '../../Components/ConfitmationModalContent';
import { ProgressModalContent } from './ProgressModalContent';

interface Props {
  bidTokenId: string;
  exhibitCanisterId: string;
  exhibitTokenIndex: number;
  tokenIndex: number;
  baseUrl: string;
}

export const ExhibitButton: FC<Props> = ({
  bidTokenId,
  exhibitCanisterId,
  exhibitTokenIndex,
  tokenIndex,
  baseUrl,
}) => {
  const dispatch = useAppDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isProgress, setIsProgress] = useState(false);

  const handleClickBidButton = () => {
    onOpen();
  };

  const handleClickYesButton = async () => {
    dispatch(reset());
    setIsProgress(true);
    await dispatch(
      offerBid({ bidTokenId, exhibitCanisterId, exhibitTokenIndex })
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    // dispatch(updateNft({ tokenId, tokenIndex, status: 'exhibit' }));
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
        {isProgress ? (
          <ProgressModalContent />
        ) : (
          <ConfirmationModalContent
            title='Do you wish to bid using your NFT?'
            tokenId={bidTokenId}
            tokenIndex={tokenIndex}
            baseUrl={baseUrl}
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
        onClick={handleClickBidButton}
      >
        <Text fontWeight='semibold'>Bid</Text>
      </Button>
    </>
  );
};
