import React from 'react';
import { Outlet } from 'react-router-dom';
import { Center } from '@chakra-ui/react';

import { useAppSelector } from '../../app/hooks';
import { selectIsLogin } from './authSlice';

export const PrivateRoute = () => {
  const isLogin = useAppSelector(selectIsLogin);

  return isLogin ? <Outlet /> : <Center h='80vh'>You need to login</Center>;
};
