import React, { useCallback, useEffect, useState } from 'react'
import { Avatar, Button, Image } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { IItem } from '../../models/item';
import { useRouter } from 'next/router';
import { getItem } from '../../services/firestore/item';
import { openNotificationWithIcon } from '../../components/notification/Notification';
import CenterLoader from '../../components/loader/CenterLoader';
import Caraousel from '../../components/caraousel/Caraousel';
import { IUser } from '../../models/user';
import { getUser } from '../../services/firestore/users';

export default function ItemDescription() {
    const [item, setItem] = useState<IItem | undefined>()
    const router = useRouter()
    const [owner, setOwner] = useState<IUser | undefined>();

    function convertToMapsLink(address: string) {
        const link = "http://maps.google.com/maps?q=" + encodeURIComponent(address);
        console.log(link);
        return (
            <Link href={link}>
                <a target="_blank" className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500">{address}</a>
            </Link>
        )
    }

    const fetchData = useCallback(async () => {
        const uid = router.query.uid;
        if (uid) {
            try {
                const itemData = await getItem(uid as string);
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

    }, [router.query.uid])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    if (!item) {
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
                                    {convertToMapsLink(item.location.address)}
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
                                    </fieldset>
                                </div>
                                <Button type="primary" shape="round" size="large" className="mt-10 w-full py-3 px-8">Request</Button>
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
