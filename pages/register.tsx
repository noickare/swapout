import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, Spin } from 'antd';
import { MailOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { createUserWithEmailAndPassword, getAdditionalUserInfo, signInWithPopup, } from "firebase/auth";
import { PasswordInput } from 'antd-password-input-strength';
import { firebaseAuth, googleAuthProvider } from '../services/init_firebase';
import { useRouter } from 'next/router';
import { openNotificationWithIcon } from '../components/notification/Notification';
import { useAuth } from '../context/authContext';
import { GenerateSiteTags } from '../utils/generateSiteTags';

const { Title } = Typography;

export default function Register() {
  const [level, setLevel] = useState(0)
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();
  const { authUser, authLoading } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);


  const minLevel = 1;
  const errorMessage = 'Password is too weak';

  const onFinish = async (values: any) => {
    setIsRegistering(true);
    try {
      await createUserWithEmailAndPassword(firebaseAuth, values.email, values.password);
      setIsRegistering(false);
      router.push('/');
    } catch (error: any) {
      setIsRegistering(false);
      console.log(error.message);
      if (error.message.includes('email-already-in-use')) {
        openNotificationWithIcon('error', 'Email already in Use', 'Email already in use, please use a different email address or sign in!')
      } else {
        openNotificationWithIcon('error', 'Registration Failed', 'An Error ocurred during registration please try again!')
      }
    }
  };

  const onRegisterWithGoogle = async () => {
    setIsRegistering(true);
    try {
      await signInWithPopup(firebaseAuth, googleAuthProvider);
      setIsRegistering(false);
      router.push('/');
    } catch (error) {
      // TODO: Log error!
      openNotificationWithIcon('error', 'Registration Failed', 'An Error ocurred during registration please try again!')
      setIsRegistering(false);
    }
  }
  React.useEffect(() => {
    if (authUser && !authLoading) {
      setPageLoading(false);
      router.push('/');
    } else {
      setPageLoading(false);
      router.push('/register');
    }
  }, []);

  if (pageLoading) return (
    <>
      <Spin size="large" />
    </>
  )


  return (
    <>
      <GenerateSiteTags title="clueswap | Register" description="Create new account" image="" url={`${process.env.NEXT_PUBLIC_URL}/register` || 'http://clueswap.com/register'} />
      <div className="flex flex-col content-center justify-center h-full mt-12 w-full">
        <Card className="w-full md:w-3/4 lg:w-1/2" style={{ margin: '0 auto' }}>
          <Title className="text-center" level={3}>Register</Title>
          <div className="flex justify-center content-center mt-5 mb-5">
            <Button loading={isRegistering} disabled={isRegistering} onClick={onRegisterWithGoogle} className="flex justify-center content-center" type="primary" shape="round" icon={<GoogleOutlined className="text-2xl" />} size="large">Register with Google</Button>
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
                  message: 'Not a valid email!',
                  type: 'email'
                },
              ]}
            >
              <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{
                validator: async () => {
                  return level >= minLevel ? Promise.resolve() : Promise.reject(errorMessage);
                },
                message: errorMessage
              }]}
            >
              <PasswordInput onLevelChange={setLevel} placeholder="Password" prefix={<LockOutlined />} />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              rules={[
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    const password = getFieldValue('password');
                    if (password !== value) {
                      return Promise.reject([
                        "Passwords do not match"
                      ]);
                    }
                    return Promise.resolve();
                  }
                })
              ]}
            >
              <Input.Password type="password" placeholder="Confirm Password" prefix={<LockOutlined />} />
            </Form.Item>
            <Form.Item>
              <Button loading={isRegistering} disabled={isRegistering} type="primary" htmlType="submit" className="login-form-button">
                Register
              </Button>
              {" "} OR {" "}
              <Link href='/login'>
                <a className='inline-flex items-center p-2 mr-4 '>
                  Sign in
                </a>
              </Link>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  )
}
