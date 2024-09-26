import React, { useState } from 'react';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  {
    label: 'Device Manager',
    key: 'mail',
    icon: <MailOutlined />,
  },
  {
    label: 'Certificate Trader',
    key: 'app',
    icon: <AppstoreOutlined />,
  },
  {
    label: 'Settings',
    key: 'SubMenu',
    icon: <SettingOutlined />,
    children: [
      {
        type: 'group',
        children: [
          { label: 'Disconnect', key: 'setting:1' },
        ],
      },
    ],
  },
  
];

const App: React.FC = () => {
  const [current, setCurrent] = useState('mail');

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
    setCurrent(e.key);
  };

  return <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />;
};

export default App;