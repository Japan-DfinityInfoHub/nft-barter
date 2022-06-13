import React from 'react';
import {
  ModalHeader,
  ModalBody,
  ModalContent,
  HStack,
  VStack,
  Spacer,
  Text,
  ModalFooter,
} from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import boxIcon from '@iconify/icons-bi/box';
import mailIcon from '@iconify/icons-codicon/mail';
import importIcon from '@iconify/icons-uil/import';
import picIcon from '@iconify/icons-icon-park-solid/pic';
import arrowRight from '@iconify/icons-bi/arrow-right';
import { useAppSelector } from '../../app/hooks';

import { selectStatus } from './bidSlice';
import { IconWithSpinner } from '../../Components/IconWithSpinner';

const ArrowRight = () => {
  return (
    <VStack>
      <Icon icon={arrowRight} height='40' />
      <Text fontSize='md'>
        <br />
        <br />
      </Text>
    </VStack>
  );
};

export const ProgressModalContent = () => {
  const {
    isCreatingChildCanisterFinished,
    isTransferNftFinished,
    isImportingNftFinished,
    isBiddingNftFinished,
  } = useAppSelector(selectStatus);

  const isCreatingCanister = !isCreatingChildCanisterFinished;
  const isTransferingNft =
    isCreatingChildCanisterFinished && !isTransferNftFinished;
  const isImportingNft = isTransferNftFinished && !isImportingNftFinished;
  const isBiddingNft = isImportingNftFinished && !isBiddingNftFinished;

  return (
    <ModalContent mx='4px'>
      <ModalHeader mx='auto'>Bid in Progress</ModalHeader>
      <ModalBody>
        <VStack>
          <Text fontSize='md'>
            Please wait a moment until the process finishes
          </Text>
          <Spacer />
          <HStack alignItems='center' spacing='20px'>
            <VStack textAlign='center'>
              <IconWithSpinner
                loading={isCreatingCanister}
                isFinished={isCreatingChildCanisterFinished}
              >
                <Icon
                  icon={boxIcon}
                  height='36'
                  color={
                    isCreatingChildCanisterFinished ? '#FFFFFF' : '#0D0041'
                  }
                />
              </IconWithSpinner>
              <Text fontSize='md'>
                Creating <br />
                canister
              </Text>
            </VStack>

            <ArrowRight />

            <VStack textAlign='center'>
              <IconWithSpinner
                loading={isTransferingNft}
                isFinished={isTransferNftFinished}
              >
                <Icon
                  icon={mailIcon}
                  height='36'
                  color={isTransferNftFinished ? '#FFFFFF' : '#0D0041'}
                />
              </IconWithSpinner>
              <Text fontSize='md'>
                Transfering <br /> NFT
              </Text>
            </VStack>

            <ArrowRight />

            <VStack textAlign='center'>
              <IconWithSpinner
                loading={isImportingNft}
                isFinished={isImportingNftFinished}
              >
                <Icon
                  icon={importIcon}
                  height='36'
                  color={isImportingNftFinished ? '#FFFFFF' : '#0D0041'}
                />
              </IconWithSpinner>
              <Text fontSize='md'>
                Importing <br /> NFT
              </Text>
            </VStack>

            <ArrowRight />

            <VStack textAlign='center'>
              <IconWithSpinner
                loading={isBiddingNft}
                isFinished={isBiddingNftFinished}
              >
                <Icon
                  icon={picIcon}
                  height='36'
                  color={isBiddingNftFinished ? '#FFFFFF' : '#0D0041'}
                />
              </IconWithSpinner>
              <Text fontSize='md'>
                Bidding <br /> NFT
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </ModalBody>
      <ModalFooter justifyContent='center'>
        <Spacer />
      </ModalFooter>
    </ModalContent>
  );
};
