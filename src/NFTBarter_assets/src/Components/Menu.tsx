import React from 'react';
import { Link } from 'react-router-dom';
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

import { useAppDispatch } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { UserIcon } from './UserIcon';

export const Menu = () => {
  const dispatch = useAppDispatch();

  const iconSize = 28;
  const fontSize = 'md';

  const handleLogoutClick = async () => {
    await dispatch(logout());
  };

  return (
    <MenuChakra>
      <MenuButton>
        <UserIcon diameter={40} />
      </MenuButton>
      <MenuList>
        <Link to='/profile'>
          <MenuItem icon={<Icon icon={userOutlined} height={iconSize} />}>
            <Text fontSize={fontSize}>Profile</Text>
          </MenuItem>
        </Link>
        <Link to='/mint'>
          <MenuItem icon={<Icon icon={createIcon} height={iconSize} />}>
            <Text fontSize={fontSize}>Mint</Text>
          </MenuItem>
        </Link>
        <MenuDivider />
        <MenuItem
          icon={<Icon icon={logoutIcon} height={iconSize} />}
          onClick={handleLogoutClick}
        >
          <Text fontSize={fontSize}>Logout</Text>
        </MenuItem>
      </MenuList>
    </MenuChakra>
  );
};
