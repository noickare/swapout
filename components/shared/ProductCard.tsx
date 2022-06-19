/* eslint-disable @next/next/no-img-element */
import { EnvironmentOutlined, UserSwitchOutlined } from '@ant-design/icons';
import Link from 'next/link';
import React from 'react'
import { convertToMapsLink, truncateString } from '../../utils/helpers';

type Props = {
    image: string;
    name: string;
    address: string;
    itemToExchangeWith?: string;
}

export default function ProductCard({ image, name, address, itemToExchangeWith }: Props) {
    return (
        <div>
            <div className="max-w-sm bg-white rounded-lg shadow-md">
                <img className="rounded-t-lg" src={image} alt="product image" />
                <div className="px-5 pb-5">
                    <h5 className="text-xl font-semibold tracking-tight">{truncateString(name, 80)}</h5>
                    <div className="flex items-center mt-2.5 mb-5">
                        <div className="flex items-center">
                            <EnvironmentOutlined />
                            <p className="sr-only">Location</p>
                            <Link href={convertToMapsLink(address)}>
                                <a target="_blank" className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500">{address}</a>
                            </Link>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        {itemToExchangeWith && (
                            <span className="text-xl">
                                <UserSwitchOutlined style={{ marginRight: 5 }} />
                                {" "}{" "}{truncateString(itemToExchangeWith, 40)}
                            </span>
                        )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}