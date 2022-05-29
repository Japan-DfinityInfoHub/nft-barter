import React, { FC } from 'react';
import { Center, Box, HStack, Image, Text } from '@chakra-ui/react';
import { useAppSelector } from '../app/hooks';
import { selectPrincipal } from '../features/auth/authSlice';
import { UserIcon } from './UserIcon';
import { MyGenerativeArtNFTs } from '../features/myGenerativeArtNFT/MyGenerativeArtNFTs';

const PrincipalID: FC<{ principal: string }> = ({ principal }) => {
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
          {principal}
        </Text>
      </HStack>
    </Box>
  );
};

export const Profile = () => {
  const principal = useAppSelector(selectPrincipal);

  return (
    <>
      <Box h={{ base: '32', sm: '40' }} bg='#EDF4FF' />
      <Center pos='relative'>
        <Box pos='absolute' top='-50'>
          <UserIcon diameter={100} />
        </Box>
        <Box mt='20'>{principal && <PrincipalID principal={principal} />}</Box>
      </Center>
      <MyGenerativeArtNFTs />
      <Center h='60vh'></Center>
    </>
  );
};
