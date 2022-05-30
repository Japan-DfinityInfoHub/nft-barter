import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import { useAppDispatch } from '../../app/hooks';
import { checkAuth } from './authSlice';
import { Layout } from '../../Components/Layout';

export const PublicRoute = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, []);

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};
