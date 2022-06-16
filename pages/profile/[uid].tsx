import { EnvironmentOutlined, ShareAltOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Button, Divider, Menu, Typography } from 'antd'
import Link from 'next/link';
import React from 'react'
import { convertToMapsLink } from '../../utils/helpers';

const { Title } = Typography;

const items = [
  { label: 'item 1', key: 'item-1' }, // remember to pass the key prop
  { label: 'item 2', key: 'item-2' }, // which is required
  {
    label: 'sub menu',
    key: 'submenu',
    children: [{ label: 'item 3', key: 'submenu-item-1' }],
  },
];

export default function UserProfile() {
  return (
    <div className="m-20">
      <div className="flex items-center ">
        <Avatar
          size={128}
          icon={<UserOutlined />}
        />
        <div className="m-5">
          <Title level={5}>Likono</Title>
          <EnvironmentOutlined />
          <p className="sr-only">Location</p>
          <Link href={convertToMapsLink('Staten island Ny')}>
            <a target="_blank" className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500">staten island Ny</a>
          </Link>
          <div className="mt-50">
            <Button size="large" type="primary" shape="circle" icon={<ShareAltOutlined />} />
          </div>
        </div>
      </div>
      <div className="mt-20">
        <Divider />
      </div>
    </div>
  )
}
