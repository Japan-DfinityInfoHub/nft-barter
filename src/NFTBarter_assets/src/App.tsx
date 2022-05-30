import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { PrivateRoute } from './features/auth/PrivateRoute';
import { PublicRoute } from './features/auth/PublicRoute';

import { SampleLoginPage } from './features/auth/SampleLoginPage';

import { Profile } from './Components/Profile';
import { NFTMint } from './Components/NFTMint';
import { NotFound } from './Components/NotFound';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<PublicRoute />}>
          <Route path='' element={<SampleLoginPage />} />
        </Route>
        <Route path='/profile' element={<PrivateRoute />}>
          <Route path='' element={<Profile />} />
        </Route>
        <Route path='/mint' element={<PrivateRoute />}>
          <Route path='' element={<NFTMint />} />
        </Route>
        <Route path='*' element={<PublicRoute />}>
          <Route path='' element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
