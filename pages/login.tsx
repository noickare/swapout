import React, { useState } from 'react'
import { Form, Input, Button, Checkbox, Card, Typography } from 'antd';
import { LockOutlined, GoogleOutlined, MailOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { firebaseAuth, googleAuthProvider } from '../services/init_firebase';
import { useRouter } from 'next/router';
import { openNotificationWithIcon } from '../components/notification/Notification';

const { Title } = Typography;


export default function Login() {

  const [isSigningIn, setIsSigningIn] = useState(false);
  const router = useRouter();

  const onFinish = async (values: any) => {
    setIsSigningIn(true);
    try {
      await signInWithEmailAndPassword(firebaseAuth, values.email, values.password)
      setIsSigningIn(false);
      router.push('/');
    } catch (error: any) {
      if (error.message.includes('invalid-email') || error.message.includes('user-not-found') || error.message.includes('wrong-password')) {
        openNotificationWithIcon('error', 'Invalid credentials', 'You entered invalid credentials please try again.')
        setIsSigningIn(false);
      } else {
        openNotificationWithIcon('error', 'Sign in sailed', 'An Error ocurred during sign in please try again!')
        setIsSigningIn(false);
      }
    }
  };
  const onLoginWithGoogle = async () => {
    setIsSigningIn(true);
    try {
      await signInWithPopup(firebaseAuth, googleAuthProvider);
      setIsSigningIn(false);
      router.push('/');
    } catch (error) {
      // TODO: Log error!
      openNotificationWithIcon('error', 'Sign in sailed', 'An Error ocurred during sign in please try again!')
      setIsSigningIn(false);
    }
  }

  return (
    <div className="flex flex-col content-center justify-center h-full mt-12 w-full">
      <Card className="w-full md:w-3/4 lg:w-1/2" style={{ margin: '0 auto' }}>
        <Title className="text-center" level={3}>Login</Title>
        <div className="flex justify-center content-center mt-5 mb-5">
          <Button loading={isSigningIn} onClick={onLoginWithGoogle} className="flex justify-center content-center" type="primary" shape="round" icon={<GoogleOutlined className="text-2xl" />} size="large">Login with Google</Button>
        </div>
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
                message: 'Please input your Email!',
              },
            ]}
          >
            <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: 'Please input your Password!',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Link href='/forgot-password'>
              <a className='inline-flex items-center p-2 mr-4 '>
                Forgot password
              </a>
            </Link>
          </Form.Item>

          <Form.Item>
            <Button loading={isSigningIn} type="primary" htmlType="submit" className="login-form-button">
              Log in
            </Button>
            {" "} OR {" "}
            <Link href='/register'>
              <a className='inline-flex items-center p-2 mr-4 '>
                register now!
              </a>
            </Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
