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


type Props = {
  url: string;
  title: string;
}



export default function Share({ url, title }: Props) {
  const menu = (
    <Menu
      style={{ display: 'flex' }}
      items={
        [
          {
            key: '1',
            label: (
              <TwitterShareButton
                url={url}
                title={title}
              >
                <TwitterIcon size={32} round />
              </TwitterShareButton>
            ),
          },
          {
            key: '2',
            label: (
              <FacebookShareButton
                url={url} >
                <FacebookIcon size={32} round />
              </FacebookShareButton>
            ),
          },
          {
            key: '3',
            label: (
              <PinterestShareButton
                url={url}
                media={title}
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
                url={url} >
                <RedditIcon size={32} round />
              </RedditShareButton>
            ),
          },
          {
            key: '5',
            danger: true,
            label: (
              <WhatsappShareButton
                url={url} >
                <WhatsappIcon size={32} round />
              </WhatsappShareButton>
            ),
          },
          {
            key: '6',
            danger: true,
            label: (
              <LinkedinShareButton
                url={url} >
                <LinkedinIcon size={32} round />
              </LinkedinShareButton>
            ),
          },
          {
            key: '7',
            danger: true,
            label: (
              <EmailShareButton
                url={url}
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