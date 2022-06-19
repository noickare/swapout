import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react'
import { IItem } from '../../models/item';
import { getItems } from '../../services/firestore/item';
import configs from '../../shared/configs';
import { openNotificationWithIcon } from '../notification/Notification';
import NothingFound from '../shared/NothingFound';
import ProductCard from '../shared/ProductCard';

type Props = {}

export default function Conversations({ }: Props) {
    const [items, setItems] = useState<IItem[]>([])
    const [lastItem, setLastItem] = useState<QueryDocumentSnapshot<DocumentData> | undefined>()

    const router = useRouter();

    const fetchData = useCallback(async () => {
        try {
            const paginatedItems = await getItems();
            const unique = [...items, ...paginatedItems.itemsArray].filter((v, i, a) => a.indexOf(v) === i);
            setLastItem(paginatedItems.lastVisible);
            setItems(unique);
        } catch (error) {
            openNotificationWithIcon('error', 'Oops!', 'Something went wrong getting the latest documents, please refresh page!')
            if (!items.length) {
                router.push('/500');
            }
        }
    }, [])

    function renderItems() {
        return items.map((itm, i) => {
            return (
                <div className="m-5" key={i}>
                    <Link href={`/item/${itm.uid}/details`}>
                        <a>
                            <ProductCard image={itm.images ? itm.images[0] : configs.noImage} name={itm.name} address={itm.location.address} />
                        </a>
                    </Link>
                </div>)
        })
    }

    useEffect(() => {
        fetchData();
    }, [fetchData])


    return (
        <div>
            {(items && items.length) ? (
                <div className="flex flex-wrap justify-center">
                    {renderItems()}
                </div>
            ) : (
                <div>
                    <NothingFound />
                </div>
            )}
        </div>
    )
}
