import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

import { PrivateRoute } from './features/auth/PrivateRoute';
import { PublicRoute } from './features/auth/PublicRoute';

import { SampleLoginPage } from './features/auth/SampleLoginPage';

import { Profile } from './Components/Profile';
import { NFTMint } from './Components/NFTMint';
import { NFTDetail } from './Components/NFTDetail';
import { NotFound } from './Components/NotFound';
import { Marketplace } from './features/marketplace/Marketplace';
import { BidPage } from './features/bid/BidPage';

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
        <Route path='/asset' element={<PublicRoute />}>
          <Route path=':tokenId' element={<NFTDetail />} />
        </Route>
        <Route path='/marketplace' element={<PublicRoute />}>
          <Route path='' element={<Marketplace />} />
        </Route>
        <Route path='/bid' element={<PrivateRoute />}>
          <Route path=':exhibitId' element={<BidPage />} />
        </Route>
        <Route path='*' element={<PublicRoute />}>
          <Route path='' element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
