import React, { FC, useEffect } from 'react';
import { Center, VStack, Text, Button } from '@chakra-ui/react';

import { useAppSelector, useAppDispatch } from '../../app/hooks';
import {
  checkAuth,
  login,
  logout,
  selectIsLogin,
  selectPrincipal,
  selectUserProfile,
  selectErrorMessage,
} from './authSlice';

interface ButtonProps {
  onClick: () => Promise<void>;
  text: string;
}

const SampleButton: FC<ButtonProps> = ({ text, onClick }) => (
  <Button
    color='white'
    px='1em'
    fontSize='md'
    height='2.5em'
    bg='blue.300'
    borderRadius='lg'
    _hover={{ bg: 'blue.400' }}
    onClick={onClick}
  >
    {text}
  </Button>
);

export const SampleLoginPage: FC = () => {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector(selectIsLogin);
  const principal = useAppSelector(selectPrincipal);
  const userProfile = useAppSelector(selectUserProfile);
  const errorMessage = useAppSelector(selectErrorMessage);

  const handleLoginClick = async () => {
    await dispatch(login());
  };

  const handleLogoutClick = async () => {
    await dispatch(logout());
  };

  useEffect(() => {
    dispatch(checkAuth());
  });

  return (
    <Center h='100vh'>
      <VStack>
        <h1>Sample Login Page</h1>
        {userProfile && (
          <Text>USER PROFILE : {JSON.stringify(userProfile)}</Text>
        )}
        {principal && <Text>YOUR PRINCIPAL IS : {principal}</Text>}
        {errorMessage && <Text>ERROR : {errorMessage}</Text>}

        {isLogin ? (
          <SampleButton onClick={handleLogoutClick} text={'Logout'} />
        ) : (
          <SampleButton onClick={handleLoginClick} text={'Login'} />
        )}
      </VStack>
    </Center>
  );
};
