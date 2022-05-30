import React from 'react';
import {
  Menu as MenuChakra,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
} from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import logoutIcon from '@iconify/icons-material-symbols/logout';
import createIcon from '@iconify/icons-gridicons/create';
import userOutlined from '@iconify/icons-ant-design/user-outlined';

import { UserIcon } from './UserIcon';

export const Menu = () => {
  const iconSize = 28;
  const fontSize = 'md';

  return (
    <MenuChakra>
      <MenuButton>
        <UserIcon diameter={40} />
      </MenuButton>
      <MenuList>
        <MenuItem icon={<Icon icon={userOutlined} height={iconSize} />}>
          <Text fontSize={fontSize}>Profile</Text>
        </MenuItem>
        <MenuItem icon={<Icon icon={createIcon} height={iconSize} />}>
          <Text fontSize={fontSize}>Mint</Text>
        </MenuItem>
        <MenuDivider />
        <MenuItem icon={<Icon icon={logoutIcon} height={iconSize} />}>
          <Text fontSize={fontSize}>Logout</Text>
        </MenuItem>
      </MenuList>
    </MenuChakra>
  );
};
