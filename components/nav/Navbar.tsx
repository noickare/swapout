import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useMediaQuery } from 'react-responsive'
import { useAuth } from '../../context/authContext';
import { Button, Dropdown, Menu, Space, Avatar, MenuProps, Drawer } from 'antd';
import { BellOutlined, LoginOutlined, LogoutOutlined, MessageOutlined, SwapOutlined, UserOutlined } from '@ant-design/icons';
import { signOut } from "firebase/auth";
import { firebaseAuth } from '../../services/init_firebase';
import { openNotificationWithIcon } from '../notification/Notification';
import { useRouter } from 'next/router';
import AutocompleteClass from '../Search/Search';
import { useIsConversationScreen } from '../../context/isConversationScreen';
import configs from '../../shared/configs';
import { getNotifications } from '../../services/firestore/users';
import { INotification } from '../../models/notification';
import { updateDoc, doc } from 'firebase/firestore';
import { firestore } from '../../services/init_firebase';


const Navbar = (props: any) => {
    const [hamburgerActive, setHamburgerActive] = useState(false);
    const isBigScreen = useMediaQuery({ query: '(min-width: 1024px)' })
    const { authUser, authLoading } = useAuth();
    const router = useRouter()
    const { isConversationScreen } = useIsConversationScreen()
    const [notificationData, setNotificationsData] = useState<INotification[]>([])

    const isDesktopOrLaptop = useMediaQuery({
        query: '(min-width: 1224px)'
    })

    const handleMenuClick: MenuProps['onClick'] = async (e) => {
        if (e.key === "2") {
            try {
                await signOut(firebaseAuth);
                router.push('/login')
            } catch (error) {
                openNotificationWithIcon('error', 'Sign out failed', 'An Error ocurred during signing out please try again!')
            }
        } else {
            router.push(`/profile/${authUser?.uid}`)
        }

    };

    const menu = (
        <Menu
            onClick={handleMenuClick}
            items={[
                {
                    key: '1',
                    label: 'Profile',
                    icon: <UserOutlined />,
                },
                {
                    key: '2',
                    label: 'Logout',
                    icon: <LogoutOutlined />,
                },
            ]}
        />
    );
    const renderNotificationItems = notificationData.map((not, i) => {
        return {
            key: i.toString(),
            label: (
                <Link href={not.deepLink} onClick={() => {
                    updateDoc(doc(firestore, "users", authUser?.uid as string, "notifications", not.uid), {
                        seen: true,
                    });
                }}>
                    <a>
                        {not.content}
                    </a>
                </Link>
            ),
        }
    })
    const NotificationMenu = notificationData.length ? (
        <Menu
            items={renderNotificationItems}
        />
    ) : (
        <Menu
            items={[
                {
                    key: '1',
                    label: (
                        <span>You have no new notifications</span>
                    ),
                },
            ]}
        />
    );


    function renderNotifications() {
        return (
            <>
                <Dropdown overlay={NotificationMenu} placement="bottom" arrow={{ pointAtCenter: true }}>
                    <BellOutlined
                        className='inline-flex p-3 hover:bg-purple-800 rounded lg:hidden text-white ml-auto cursor-pointer'
                    />
                </Dropdown>
            </>
        )
    }

    const fetchNotificationsData = useCallback(async () => {
        if (authUser?.uid) {
            try {
                const notificationsData = await getNotifications({ userId: authUser.uid });
                setNotificationsData(notificationsData.notificationsArray);
            } catch (error: any) {
                console.log(error);
            }
        }

    }, [authUser?.uid])

    useEffect(() => {
        fetchNotificationsData()
    }, [fetchNotificationsData])



    return (
        <div className="flex flex-col justify-center items-center">
            <nav className='flex items-center flex-wrap bg-purple-500 w-full mb-2'>
                <Link href='/'>
                    <a className='inline-flex items-center p-2 mr-4 '>
                        <svg
                            viewBox='0 0 24 24'
                            xmlns='http://www.w3.org/2000/svg'
                            className='fill-current text-white h-8 w-8 mr-2'
                        >
                            <path d='M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z' />
                        </svg>
                        <span className='text-xl text-white font-bold uppercase tracking-wide'>
                            ClueSwap
                        </span>
                    </a>
                </Link>
                {
                    isDesktopOrLaptop && (
                        <AutocompleteClass />
                    )
                }
                <div
                    className='inline-flex p-3  text-white ml-auto hover:text-white outline-none text-xl'
                >
                    <div className="lg:hidden">
                        {renderNotifications()}
                    </div>
                    <button
                        className="hover:bg-purple-800 rounded lg:hidden"
                        onClick={() => {
                            setHamburgerActive(!hamburgerActive);
                        }}
                    >
                        <svg
                            className='w-6 h-6'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                            xmlns='http://www.w3.org/2000/svg'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M4 6h16M4 12h16M4 18h16'
                            />
                        </svg>
                    </button>

                </div>
                {(hamburgerActive && !isBigScreen) && (
                    <>
                        <Drawer placement="right" onClose={() => setHamburgerActive(false)} visible={hamburgerActive}>
                            {
                                authUser ? (
                                    <div className='lg:inline-flex lg:flex-row lg:ml-auto lg:w-auto w-full lg:items-center items-start  flex flex-col lg:h-auto'>
                                        <Link href={`/profile/${authUser.uid}`}>
                                            <a className='lg:inline-flex lg:w-auto w-full px-3 py-2 rounded font-bold items-center justify-center hover:bg-purple-800 hover:text-white '>
                                                Profile
                                            </a>
                                        </Link>
                                        <Link href='/create-swap'>
                                            <a className='mr-5 lg:inline-flex lg:w-auto w-full px-3 py-2 rounded font-bold items-center justify-center hover:bg-purple-800 hover:text-white'>
                                                <Space>
                                                    <SwapOutlined />
                                                    SWAP
                                                </Space>
                                            </a>
                                        </Link>
                                        <Link href='/conversations'>
                                            <a className='mr-5 lg:inline-flex lg:w-auto w-full px-3 py-2 rounded font-bold items-center justify-center hover:bg-purple-800 hover:text-white'>
                                                <Space>
                                                    <MessageOutlined />
                                                    Messages
                                                </Space>
                                            </a>
                                        </Link>
                                        <div
                                            className='lg:inline-flex lg:w-auto w-full px-3 py-2 rounded font-bold items-center justify-center hover:bg-purple-800 hover:text-white '
                                            onClick={async () => {
                                                try {
                                                    await signOut(firebaseAuth);
                                                    router.push('/login')
                                                } catch (error) {
                                                    openNotificationWithIcon('error', 'Sign out failed', 'An Error ocurred during signing out please try again!')
                                                }
                                            }}
                                        >
                                            <Space className="flex content-center justify-center align-center cursor-pointer">
                                                <LogoutOutlined />
                                                Logout
                                            </Space>
                                        </div>

                                    </div>
                                ) : (
                                    <div className='lg:inline-flex lg:flex-row lg:ml-auto lg:w-auto w-full lg:items-center items-start  flex flex-col lg:h-auto'>
                                        <Link href='/login'>
                                            <a className='lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-white font-bold items-center justify-center hover:bg-purple-800 hover:text-white '>
                                                Login
                                            </a>
                                        </Link>
                                        <Link href='/register'>
                                            <a className='lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-white font-bold items-center justify-center hover:bg-purple-800 hover:text-white '>
                                                Register
                                            </a>
                                        </Link>
                                    </div>
                                )
                            }
                        </Drawer>
                    </>
                )}
                <div className='hidden w-full lg:inline-flex lg:flex-grow lg:w-auto'>
                    <div className='lg:inline-flex lg:flex-row lg:ml-auto lg:w-auto w-full lg:items-center items-start  flex flex-col lg:h-auto'>
                        <Link href='/create-swap'>
                            <a className='mr-5 lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-white font-bold items-center justify-center hover:bg-purple-800 hover:text-white'>
                                <Space>
                                    SWAP
                                    <SwapOutlined />
                                </Space>
                            </a>
                        </Link>
                        <div
                            className='mr-5 lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-white font-bold items-center justify-center hover:bg-purple-800 hover:text-white text-xl'
                        >
                            {renderNotifications()}
                        </div>
                        <Link href='/conversations'>
                            <a className='mr-5 lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-white font-bold items-center justify-center hover:bg-purple-800 hover:text-white text-xl'>
                                <MessageOutlined />
                            </a>
                        </Link>
                        {
                            authUser ? (
                                <Dropdown className="lg:inline-flex lg:w-auto w-full px-3 py-2 rounded cursor-pointer" overlay={menu} placement="bottom" arrow={{ pointAtCenter: true }}>
                                    {authUser.avatar?.length ? (
                                        <Avatar
                                            style={{ margin: 5 }}
                                            src={authUser.avatar}
                                            size={50}
                                        />
                                    ) : (
                                        <Avatar size={50} style={{ backgroundColor: configs.primaryColor }}>{authUser.email.charAt(0).toUpperCase()}</Avatar>
                                    )}
                                </Dropdown>
                            ) : (
                                <Button
                                    onClick={() => {
                                        router.push('/login')
                                    }}
                                    icon={<LoginOutlined />}
                                    size="large"
                                    loading={authLoading}
                                >
                                    Login
                                </Button>
                            )
                        }
                    </div>
                </div>
            </nav>
            {
                (!isDesktopOrLaptop && !isConversationScreen) && (
                    // @ts-ignore
                    <AutocompleteClass width="90%" />
                )
            }
        </div>
    );
}

export default Navbar;