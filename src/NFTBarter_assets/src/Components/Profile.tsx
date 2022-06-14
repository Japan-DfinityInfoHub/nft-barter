import React, { FC } from 'react';
import { Center, Box, HStack, Image, Text } from '@chakra-ui/react';
import { useAppSelector } from '../app/hooks';
import { selectAccountId } from '../features/auth/authSlice';
import { UserIcon } from './UserIcon';
import { MyNFTs } from '../features/nfts/MyNFTs';

const AccountID: FC<{ accountId: string }> = ({ accountId }) => {
  return (
    <Box
      rounded='full'
      border='#EAF0F6'
      borderWidth='thin'
      borderStyle='solid'
      px='2'
      py='1'
    >
      <HStack spacing='2'>
        <Image
          height={'10px'}
          alt='Brand logo'
          src={`/dfinity-logo-small.png`}
        />
        <Text
          overflow='hidden'
          whiteSpace='nowrap'
          textOverflow='ellipsis'
          w='32'
          fontSize='xs'
        >
          {accountId}
        </Text>
      </HStack>
    </Box>
  );
};

export const Profile = () => {
  const accountId = useAppSelector(selectAccountId);

  return (
    <>
      <Box
        h={{ base: '32', sm: '40' }}
        w='100vw'
        position='relative'
        left='50%'
        transform='translateX(-50%)'
        bg='#EDF4FF'
      />
      <Center pos='relative'>
        <Box pos='absolute' top='-50'>
          <UserIcon diameter={100} accountId={accountId} />
        </Box>
        <Box mt='20'>{accountId && <AccountID accountId={accountId} />}</Box>
      </Center>
      <MyNFTs />
    </>
  );
};
