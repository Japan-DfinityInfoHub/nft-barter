import React from 'react';
import { Layout } from './Components/Layout';
import { SampleLoginPage } from './features/auth/SampleLoginPage';

export const App = () => {
  return (
    <Layout>
      <SampleLoginPage />
    </Layout>
  );
};
