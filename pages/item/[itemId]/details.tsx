import React, { useCallback, useEffect, useState } from 'react'
import { Affix, AutoComplete, Avatar, Button, Form, Input, Modal, Select, Tooltip, Typography } from 'antd';
import { AntDesignOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { IItem } from '../../../models/item';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { getItem, getItemConversations, getUserItems } from '../../../services/firestore/item';
import { openNotificationWithIcon } from '../../../components/notification/Notification';
import CenterLoader from '../../../components/loader/CenterLoader';
import Caraousel from '../../../components/caraousel/Caraousel';
import { IUser } from '../../../models/user';
import { getUser } from '../../../services/firestore/users';
import { convertToMapsLink } from '../../../utils/helpers';
import { useAuth } from '../../../context/authContext';
import { addDoc, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { firestore } from '../../../services/init_firebase';
import { THEMES } from '../../../shared/constants';
import { IConversation } from '../../../models/conversation';
import { GenerateSiteTags } from '../../../utils/generateSiteTags';
import configs from '../../../shared/configs';
import { IAdress } from '../../../components/modals/UpdateUserProfile';
import UpdateItem from '../../../components/modals/UpdateItem';

const { Title, Paragraph } = Typography;

export default function ItemDescription() {
    const [item, setItem] = useState<IItem | undefined>()
    const router = useRouter()
    const [owner, setOwner] = useState<IUser | undefined>();
    const { authUser, authLoading } = useAuth();
    const [isCreating, setIsCreating] = useState(false);
    const [conversations, setConversations] = useState<IConversation[]>();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form] = Form.useForm();
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestOptions, setRequestOptions] = useState<{
        value: string;
        label: JSX.Element;
    }[] | undefined>([])
    const [isCreatingConversation, setIsCreatingConversation] = useState(false);

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

    if (!item || authLoading || isCreatingConversation) {
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
                    initiator: authUser?.uid,
                    uid: convId,
                    itemId: router.query.itemId,
                    // toSwapWith: toSwapWith,
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
                await setDoc(doc(firestore, "userConversationList", convId), {
                    users: sorted,
                    initiator: authUser?.uid,
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
                })
                setIsCreating(false);
                router.push(`/item/${router.query.itemId}/conversations/${convId}`)
            } else {
                const convId = uuidv4();
                await setDoc(doc(firestore, "items", router.query.itemId as string, "conversations", convId), {
                    users: sorted,
                    initiator: authUser?.uid,
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
                await setDoc(doc(firestore, "userConversationList", convId), {
                    users: sorted,
                    initiator: authUser?.uid,
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
                })


                setIsCreating(false);
                setIsCreatingConversation(false);
                router.push(`/conversations/${convId}`)
            }

        } else {
            !isGroup ? router.push(`/item/${router.query.itemId}/conversations/${querySnapshot.docs[0].id}`) : router.push(`/conversations/${querySnapshot.docs[0].id}`)
            setIsCreatingConversation(false);
            setIsCreating(false);
        }
    };

    const onUpdateFinish = async (values: any, address?: IAdress, imagesUrl?: string[], categories?: string[]) => {
        if (!authUser) {
            router.push('/login')
        } else {
            setIsSubmitting(true);
            try {
                await updateDoc(doc(firestore, "items", item.uid), {
                    uid: item.uid,
                    name: values.name,
                    location: {
                        lat: address?.lat as number,
                        lng: address?.lng as number,
                        address: address?.address as string,
                    },
                    description: values.description,
                    condition: values.condition,
                    yearManufactured: values.yearManufactured.format('YYYY'),
                    yearBought: values.yearBought.format('YYYY'),
                    itemToExchangeWith: values.itemTOExchange,
                    images: imagesUrl,
                    ownerId: authUser.uid,
                    createdAt: item.createdAt,
                    updatedAt: serverTimestamp(),
                    category: categories || []
                });
                fetchData();
                setEditModalVisible(false);
                setIsSubmitting(false);
                // router.push(`/item/${createdItem.uid}/details`)
            } catch (error) {
                console.log(error);
                setIsSubmitting(false);
                openNotificationWithIcon('error', 'Creation Failed', 'An Error ocurred during submission please try again!')
            }
        }
    }

    async function onRequestFinish(values: any) {
        console.log(values)
    }

    return (
        <>
            <GenerateSiteTags title={item.name} description={item.description} image={item.images?.length ? item.images[0] : configs.noImage} url={`${process.env.NEXT_PUBLIC_URL}/item/${item.uid}/details` || `http://clueswap.com/item/${item.uid}/details`} />
            <div>
                <div className="pt-6">
                    {renderImages()}
                    <div className="max-w-2xl mx-auto pt-10 pb-16 px-4 sm:px-6 lg:max-w-7xl lg:pt-16 lg:pb-24 lg:px-8 lg:grid lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8">
                        <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
                            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">{item.name}</h1>
                        </div>

                        <div className="mt-4 lg:mt-0 lg:row-span-3 relative">
                            <h2 className="sr-only">Item information</h2>
                            <p className="text-base text-gray-600">Exchange for: </p>
                            <p className="text-3xl text-gray-900">{item.itemToExchangeWith}</p>
                            {
                                authUser?.uid === item.ownerId && (
                                    <div className="absolute top-0 right-0">
                                        <Button onClick={() => setEditModalVisible(true)} type="primary" size="middle" shape="round">Edit</Button>
                                    </div>
                                )
                            }
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
                                </div>
                                {
                                    owner?.uid !== authUser?.uid && (
                                        <Button loading={isCreating} onClick={() => {
                                            if (!authUser) {
                                                router.push('/login');
                                            } else {
                                                // setIsRequestModalOpen(true);
                                                handleCreateConversation()
                                            }
                                        }} type="primary" shape="round" size="large" className="mt-10 w-full py-3 px-8">Request</Button>
                                    )
                                }
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
            <Modal
                title={null}
                centered
                visible={editModalVisible}
                onOk={() => setEditModalVisible(false)}
                onCancel={() => setEditModalVisible(false)}
                footer={null}
            >
                <UpdateItem itemData={item} onUpdateFinish={onUpdateFinish} isSubmitting={isSubmitting} />
            </Modal>
        </>
    )
}

            // <Modal
            //     title={null}
            //     centered
            //     visible={isRequestModalOpen}
            //     onOk={() => setIsRequestModalOpen(false)}
            //     onCancel={() => setIsRequestModalOpen(false)}
            //     footer={null}
            // >
            //     <div className="flex flex-col content-center justify-center h-full mt-12 w-full">
            //         <Title className="text-center" level={3}>Request Exchange</Title>
            //         <Form
            //             labelCol={{ span: 8 }}
            //             wrapperCol={{ span: 14 }}
            //             style={{ margin: '0 auto' }}
            //             className="w-full" form={form}
            //             name="control-hooks"
            //             onFinish={onRequestFinish}
            //         >
            //             <Form.Item name="exchangeFor" label="Exchange For" rules={[{ required: true }]}>
            //                 <AutoComplete
            //                     backfill
            //                     dropdownClassName="certain-category-search-dropdown"
            //                     options={requestOptions}
            //                     onSelect={(value: string) => {
            //                         setIsCreatingConversation(true);
            //                         setIsRequestModalOpen(false);
            //                         handleCreateConversation(value);
            //                     }}
            //                     onSearch={async (val) => {
            //                         if (authUser) {
            //                             const userItems = await getUserItems(authUser?.uid)
            //                             const searchItems = userItems?.itemsArray?.map((item, index) => {
            //                                 return {
            //                                     value: item.uid,
            //                                     label: (
            //                                         <div
            //                                             style={{
            //                                                 display: 'flex',
            //                                                 justifyContent: 'space-between',
            //                                                 height: 40
            //                                             }}
            //                                         >
            //                                             <span>
            //                                                 {item.name}
            //                                             </span>
            //                                             <span>
            //                                                 {/* eslint-disable-next-line @next/next/no-img-element */}
            //                                                 <img style={{ width: 40, height: '100%' }} src={item.images && item.images[0] || configs.noImage} alt="" />
            //                                             </span>
            //                                         </div>
            //                                     ),
            //                                 }
            //                             })
            //                             setRequestOptions(searchItems)
            //                         }
            //                     }}
            //                 >
            //                     <Input placeholder="Search your items" />
            //                 </AutoComplete>
            //             </Form.Item>
            //         </Form>
            //     </div>
            // </Modal>