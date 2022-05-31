import React from 'react';
import { Image, Box, Flex, Spacer, HStack } from '@chakra-ui/react';

import { useAppSelector } from '../app/hooks';
import { selectIsLogin } from '../features/auth/authSlice';
import { LoginButton } from '../features/auth/LoginButton';
import { UserIcon } from './UserIcon';
import { Menu } from './Menu';

export const Header = () => {
  const isLogin = useAppSelector(selectIsLogin);

  return (
    <Box as='header' bg='white' boxShadow='sm'>
      <Flex
        h={{ base: '14', sm: '16' }}
        maxW='1300px'
        mx='auto'
        alignItems='center'
      >
        <HStack ml={{ base: '4', sm: '3' }}>
          <Image height={'40px'} alt='Brand logo' src={`/brand-logo.svg`} />
          <Spacer />
          <Image height={'20px'} alt='Brand logo' src={`/brand-name.svg`} />
        </HStack>
        <Spacer />
        <Box as='nav' mr={{ base: '4', sm: '3' }} verticalAlign='middle'>
          {isLogin ? <Menu /> : <LoginButton />}
        </Box>
      </Flex>
    </Box>
  );
};
