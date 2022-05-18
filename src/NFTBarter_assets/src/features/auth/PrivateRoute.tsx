import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Center } from '@chakra-ui/react';

import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectIsLogin, checkAuth } from './authSlice';

export const PrivateRoute = () => {
  const isLogin = useAppSelector(selectIsLogin);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, []);

  return isLogin ? <Outlet /> : <Center h='80vh'>You need to login</Center>;
};
