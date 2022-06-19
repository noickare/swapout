import React, { useCallback, useEffect, useState } from 'react'
import { Avatar, Button, Tooltip, Typography } from 'antd';
import { AntDesignOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { IItem } from '../../../models/item';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { getItem, getItemConversations } from '../../../services/firestore/item';
import { openNotificationWithIcon } from '../../../components/notification/Notification';
import CenterLoader from '../../../components/loader/CenterLoader';
import Caraousel from '../../../components/caraousel/Caraousel';
import { IUser } from '../../../models/user';
import { getUser } from '../../../services/firestore/users';
import { convertToMapsLink } from '../../../utils/helpers';
import { useAuth } from '../../../context/authContext';
import { addDoc, collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { firestore } from '../../../services/init_firebase';
import { THEMES } from '../../../shared/constants';
import { IConversation } from '../../../models/conversation';

const { Title, Paragraph } = Typography;

export default function ItemDescription() {
    const [item, setItem] = useState<IItem | undefined>()
    const router = useRouter()
    const [owner, setOwner] = useState<IUser | undefined>();
    const { authUser, authLoading } = useAuth();
    const [isCreating, setIsCreating] = useState(false);
    const [conversations, setConversations] = useState<IConversation[]>();



    const fetchData = useCallback(async () => {
        const uid = router.query.itemId;
        if (uid) {
            try {
                const itemData = await getItem(uid as string);
                const conversations = await getItemConversations(uid as string);
                if (conversations) {
                    setConversations(conversations);
                }
                setItem(itemData);
                const ownerData = await getUser(itemData.ownerId);
                setOwner(ownerData);
            } catch (error: any) {
                console.log(error);
                if (error.message.includes('Item not found')) {
                    router.push('/404');
                } else {
                    router.push('/500');
                    openNotificationWithIcon('error', 'Internal server error', 'An Error ocurred while fetching item. Please refresh the page!')
                }
            }
        }

    }, [router.query.itemId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    if (!item || authLoading) {
        return (
            <CenterLoader />
        )
    }

    function renderImages() {
        if (item?.images?.length) {
            return (
                <Caraousel images={item?.images} />
            )
        }
    }

    const handleCreateConversation = async (isGroup?: boolean) => {
        setIsCreating(true);

        const sorted = [owner?.uid, authUser?.uid].sort();

        const q = query(
            collection(firestore, "items", router.query.itemId as string, "conversations"),
            where("users", "==", sorted)
        );

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            if (!isGroup) {
                const convId = uuidv4();
                await setDoc(doc(firestore, "items", router.query.itemId as string, "conversations", convId), {
                    users: sorted,
                    uid: convId,
                    itemId: router.query.itemId,
                    group:
                        sorted.length > 2
                            ? {
                                admins: [authUser?.uid, owner?.uid],
                                groupName: null,
                                groupImage: null,
                            }
                            : {},
                    updatedAt: serverTimestamp(),
                    seen: {},
                    theme: THEMES[0],
                });
                setIsCreating(false);
                router.push(`/item/${router.query.itemId}/conversations/${convId}`)
            } else {
                const convId = uuidv4();
                await setDoc(doc(firestore, "items", router.query.itemId as string, "conversations", convId), {
                    users: sorted,
                    uid: convId,
                    itemId: router.query.itemId,
                    group:
                        sorted.length > 2
                            ? {
                                admins: [authUser?.uid],
                                groupName: null,
                                groupImage: null,
                            }
                            : {},
                    updatedAt: serverTimestamp(),
                    seen: {},
                    theme: THEMES[0],
                });


                setIsCreating(false);
                router.push(`/conversations/${convId}`)
            }

        } else {
            !isGroup ? router.push(`/item/${router.query.itemId}/conversations/${querySnapshot.docs[0].id}`) : router.push(`/conversations/${querySnapshot.docs[0].id}`)

            setIsCreating(false);
        }
    };


    return (
        <div>
            <div>
                <div className="pt-6">
                    {renderImages()}
                    <div className="max-w-2xl mx-auto pt-10 pb-16 px-4 sm:px-6 lg:max-w-7xl lg:pt-16 lg:pb-24 lg:px-8 lg:grid lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8">
                        <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
                            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">{item.name}</h1>
                        </div>

                        <div className="mt-4 lg:mt-0 lg:row-span-3">
                            <h2 className="sr-only">Item information</h2>
                            <p className="text-base text-gray-600">Exchange for: </p>
                            <p className="text-3xl text-gray-900">{item.itemToExchangeWith}</p>

                            <div className="mt-6">
                                <h3 className="sr-only">Location</h3>
                                <div className="flex items-center">
                                    <EnvironmentOutlined />
                                    <p className="sr-only">Location</p>
                                    <Link href={convertToMapsLink(item.location.address)}>
                                        <a target="_blank" className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500">{item.location.address}</a>
                                    </Link>
                                </div>
                            </div>

                            <form className="mt-10">
                                <div>
                                    <h3 className="text-lg text-gray-600 font-medium">Year Manufactured:</h3>

                                    <fieldset className="mt-4">
                                        <legend className="sr-only">Year manufactured</legend>
                                        <div className="flex items-center space-x-3">
                                            <p className="text-base text-gray-900">{item.yearManufactured}</p>
                                        </div>
                                    </fieldset>
                                </div>
                                <div>
                                    <h3 className="text-lg text-gray-600 font-medium">Year Bought:</h3>

                                    <fieldset className="mt-4">
                                        <legend className="sr-only">Year bought</legend>
                                        <div className="flex items-center space-x-3">
                                            <p className="text-base text-gray-900">{item.yearBought}</p>
                                        </div>
                                    </fieldset>
                                </div>
                                <div>
                                    <h3 className="text-lg text-gray-600 font-medium">Owner:</h3>

                                    <fieldset className="mt-4">
                                        <legend className="sr-only">Owner</legend>
                                        <Link href={`/profile/${owner?.uid}`}>
                                            <a>
                                                <div className="flex items-center space-x-3 content-center">
                                                    {owner?.avatar?.length ? (
                                                        <Avatar
                                                            style={{ margin: 5 }}
                                                            src={owner.avatar}
                                                            size={50}
                                                        />
                                                    ) : (
                                                        <Avatar size={50} style={{ backgroundColor: '#f56a00' }}>{owner?.email.charAt(0).toUpperCase()}</Avatar>
                                                    )}
                                                    <p className="text-base text-gray-900">{owner?.name}</p>
                                                </div>
                                            </a>
                                        </Link>
                                    </fieldset>
                                </div>
                                <div className="flex content-center justify-center">
                                    <Avatar.Group
                                        maxCount={2}
                                        maxPopoverTrigger="click"
                                        size="large"
                                        maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf', cursor: 'pointer' }}
                                    >
                                        {
                                            conversations && conversations.map((conv, i) => {
                                                return (
                                                    <div key={i}>
                                                        <Link href={`/conversations/${conv.uid}`}>
                                                            <a>
                                                                <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
                                                            </a>
                                                        </Link>
                                                    </div>
                                                )
                                            })
                                        }
                                    </Avatar.Group>
                                    <Paragraph style={{ marginLeft: 10 }}> Conversations</Paragraph>
                                </div>
                                {/* <Button loading={isCreating} onClick={async () => {
                                    if (!authUser) {
                                        router.push('/login');
                                    } else {
                                        setIsCreating(true);

                                        const sorted = [authUser?.uid].sort();

                                        const q = query(
                                            collection(firestore, "conversations"),
                                            where("itemId", "==", router.query.itemId)
                                        );
                                        const querySnapshot = await getDocs(q);
                                        if (querySnapshot.empty) {
                                            const convId = uuidv4();
                                            await setDoc(doc(firestore, "conversations", convId), {
                                                users: sorted,
                                                itemId: router.query.itemId,
                                                uid: convId,
                                                group:
                                                    sorted.length > 2
                                                        ? {
                                                            admins: [authUser?.uid],
                                                            groupName: null,
                                                            groupImage: null,
                                                        }
                                                        : {},
                                                updatedAt: serverTimestamp(),
                                                seen: {},
                                                theme: THEMES[0],
                                            });

                                            setIsCreating(false);
                                            router.push(`/conversations/${convId}`)
                                        } else {
                                            router.push(`/conversations/${querySnapshot.docs[0].id}`)
                                            setIsCreating(false);
                                        }
                                    }
                                }
                                } shape="round" size="large" className="mt-10 w-full py-3 px-8">Start Conversation</Button> */}
                                <Button loading={isCreating} onClick={() => {
                                    if (!authUser) {
                                        router.push('/login');
                                    } else {
                                        handleCreateConversation()
                                    }
                                }} type="primary" shape="round" size="large" className="mt-10 w-full py-3 px-8">Request</Button>
                            </form>
                        </div>

                        <div className="py-10 lg:pt-6 lg:pb-16 lg:col-start-1 lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
                            <div>
                                <h3 className="sr-only">Description</h3>

                                <div className="space-y-6">
                                    <p className="text-base text-gray-900">{item.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
