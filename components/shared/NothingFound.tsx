import { SmileOutlined } from '@ant-design/icons';
import { Button, Result, Typography } from 'antd';
import React from 'react';

const {Paragraph} = Typography

const NothingFound: React.FC = () => (
  <Result
    icon={<SmileOutlined />}
    title="Empty! 😢"
    extra={<Paragraph>Please check back later</Paragraph>}
  />
);

export default NothingFound;