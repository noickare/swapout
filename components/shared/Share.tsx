import React from 'react'
import {
  FacebookShareButton,
  FacebookIcon,
  PinterestShareButton,
  PinterestIcon,
  RedditShareButton,
  RedditIcon,
  WhatsappShareButton,
  WhatsappIcon,
  LinkedinShareButton,
  LinkedinIcon,
  TwitterShareButton,
  TwitterIcon,
  EmailShareButton,
  EmailIcon,
} from 'next-share';
import { Button, Dropdown, Menu, Space } from 'antd';
import { ShareAltOutlined, SmileOutlined } from '@ant-design/icons';


type Props = {}

const menu = (
  <Menu
    style={{ display: 'flex' }}
    items={
      [
        {
          key: '1',
          label: (
            <TwitterShareButton
              url={'https://github.com/next-share'}
              title={'next-share is a social share buttons for your next React apps.'}
            >
              <TwitterIcon size={32} round />
            </TwitterShareButton>
          ),
        },
        {
          key: '2',
          label: (
            <FacebookShareButton
              url={'http://localhost:3000'} >
              <FacebookIcon size={32} round />
            </FacebookShareButton>
          ),
        },
        {
          key: '3',
          label: (
            <PinterestShareButton
              url={'http://localhost:3000'}
              media={'next-share is a social share buttons for your next React apps.'}
            >
              <PinterestIcon size={32} round />
            </PinterestShareButton>
          ),
        },
        {
          key: '4',
          danger: true,
          label: (
            <RedditShareButton
              url={'http://localhost:3000'} >
              <RedditIcon size={32} round />
            </RedditShareButton>
          ),
        },
        {
          key: '5',
          danger: true,
          label: (
            <WhatsappShareButton
              url={'http://localhost:3000'} >
              <WhatsappIcon size={32} round />
            </WhatsappShareButton>
          ),
        },
        {
          key: '6',
          danger: true,
          label: (
            <LinkedinShareButton
              url={'http://localhost:3000'} >
              <LinkedinIcon size={32} round />
            </LinkedinShareButton>
          ),
        },
        {
          key: '7',
          danger: true,
          label: (
            <EmailShareButton
              url={'https://github.com/next-share'}
              subject={'Next Share'}
              body="body"
            >
              <EmailIcon size={32} round />
            </EmailShareButton>
          ),
        },
      ]}
  />
);


export default function Share({ }: Props) {
  return (
    <div>
      <div>
        <Dropdown overlay={menu}>
          <a onClick={e => e.preventDefault()}>
            <Space>
              <Button size="large" type="primary" shape="circle" icon={<ShareAltOutlined />} />
            </Space>
          </a>
        </Dropdown>
      </div>
    </div>
  )
}