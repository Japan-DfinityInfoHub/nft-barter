import React, { FC, useEffect, useRef } from 'react';
import { Principal } from '@dfinity/principal';
import Jazzicon from '@metamask/jazzicon';
import { Box } from '@chakra-ui/react';

import { useAppSelector } from '../app/hooks';
import { selectPrincipal } from '../features/auth/authSlice';

interface Props {
  diameter: number;
}

export const UserIcon: FC<Props> = ({ diameter }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const principal = useAppSelector(selectPrincipal);

  useEffect(() => {
    if (principal && ref.current) {
      ref.current.innerHTML = '';

      // Since `number` in JavaScript is expressed as 64 bit (0x7FFFFFFFFFFFFFFF in hex),
      // it is safe and large enough to use the 10 chars in principal ID.
      ref.current.appendChild(
        Jazzicon(
          diameter,
          parseInt(Principal.fromText(principal).toHex().slice(0, 10), 16)
        )
      );
    }
  }, [principal]);

  return <Box ref={ref} />;
};
