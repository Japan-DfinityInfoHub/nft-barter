import React, { ReactNode, FC } from 'react';
import { Box } from '@chakra-ui/react';
import { Header } from './Header';
import { Footer } from './Footer';

interface Props {
  children: ReactNode;
}

export const Layout: FC<Props> = ({ children }) => {
  return (
    <>
      <Header />
      <Box mx='auto' maxW='1300px' minH='80vh'>
        {children}
      </Box>
      <Footer />
    </>
  );
};
