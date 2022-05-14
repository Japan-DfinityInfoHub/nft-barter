import React, { ReactNode, FC } from 'react';

import { Header } from './Header';
import { Footer } from './Footer';

interface Props {
  children: ReactNode;
}

export const Layout: FC<Props> = ({ children }) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};
