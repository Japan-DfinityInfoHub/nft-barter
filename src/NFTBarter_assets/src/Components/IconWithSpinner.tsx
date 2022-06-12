import React, { FC, ReactNode } from 'react';
import { VStack, Spinner, Circle, Box } from '@chakra-ui/react';

interface Props {
  loading: boolean;
  isFinished: boolean;
  children: ReactNode;
}

export const IconWithSpinner: FC<Props> = ({
  loading,
  children,
  isFinished,
}) => {
  return (
    <VStack>
      <Box position='relative'>
        <Circle
          size='72px'
          bgColor={isFinished ? 'green.400' : 'gray.200'}
          position='absolute'
          top='0px'
          left='0px'
        />
        <Box position='absolute' top='18px' left='18px'>
          {children}
        </Box>
        {loading && !isFinished ? (
          <Spinner
            thickness='4px'
            speed='1.0s'
            emptyColor='gray.200'
            color='blue.400'
            boxSize='72px'
          />
        ) : (
          <Box boxSize='80px' />
        )}
      </Box>
    </VStack>
  );
};
