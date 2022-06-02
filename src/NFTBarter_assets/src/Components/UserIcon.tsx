import React, { FC, useEffect, useRef } from 'react';
import Jazzicon from '@metamask/jazzicon';
import { Box } from '@chakra-ui/react';

interface Props {
  diameter: number;
  accountId: string | undefined;
}

export const UserIcon: FC<Props> = ({ diameter, accountId }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (accountId && ref.current) {
      ref.current.innerHTML = '';

      // Since `number` in JavaScript is expressed as 64 bit (0x7FFFFFFFFFFFFFFF in hex),
      // it is safe and large enough to use the 10 chars in principal ID.
      ref.current.appendChild(
        Jazzicon(diameter, parseInt(accountId.slice(0, 10), 16))
      );
    }
  }, [accountId]);

  return <Box ref={ref} />;
};
