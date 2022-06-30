import { GoogleOutlined, MailOutlined, LockOutlined } from '@ant-design/icons'
import { Card, Button, Form, Input, Checkbox, Typography, Result } from 'antd'
import Link from 'next/link'
import React, { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth';
import { GenerateSiteTags } from '../utils/generateSiteTags'
import { firebaseAuth } from '../services/init_firebase';
import { useRouter } from 'next/router';

const { Title } = Typography;

export default function ForgotPassword() {

  const [isUpdating, setIsUpdating] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const router = useRouter();

  var actionCodeSettings = {
  url: process.env.NEXT_PUBLIC_NODE_ENV === "development" ? 'http://localhost:3000/login' : 'https://clueswap.com/login',
  handleCodeInApp: false
};

  const onFinish = async (values: any) => {
    setIsUpdating(true);
    try {
      await sendPasswordResetEmail(firebaseAuth, values.email, actionCodeSettings)
      setIsUpdating(false);
      setIsEmailSent(true);
    } catch (error: any) {
      setIsUpdating(false);
      console.log('error', error);
    }
  };
  if (isEmailSent) {
    return (
      <Result
        title="Password instructions sent to your email"
        extra={
          <Button onClick={() => {
            router.push('/')
          }}
            type="primary" key="console">
            Home
          </Button>
        }
      />
    )
  }
  return (
    <div>
      <GenerateSiteTags title="clueswap | Forgot Password" description="Forgot password" image="" url={`${process.env.NEXT_PUBLIC_URL}/forgot-password` || 'http://clueswap.com/forgot-password'} />
      <div className="flex flex-col content-center justify-center h-full mt-12 w-full">
        <Card className="w-full md:w-3/4 lg:w-1/2" style={{ margin: '0 auto' }}>
          <Title className="text-center" level={3}>Forgot password</Title>
          <Form
            name="normal_login"
            className="max-w-[300px]"
            style={{ margin: '0 auto' }}
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
          >
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Not a valid email!',
                  type: 'email'
                },
              ]}
            >
              <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" />
            </Form.Item>
            <Form.Item>
              <Button loading={isUpdating} type="primary" htmlType="submit" className="login-form-button">
                Send Reset Instruction
              </Button>
              {" "} OR {" "}
              <Link href='/login'>
                <a className='inline-flex items-center p-2 mr-4 '>
                  Login
                </a>
              </Link>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  )
}
