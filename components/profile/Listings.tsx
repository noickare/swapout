import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component';
import { IItem } from '../../models/item';
import { getItems, getUserItems } from '../../services/firestore/item';
import configs from '../../shared/configs';
import CenterLoader from '../loader/CenterLoader';
import { openNotificationWithIcon } from '../notification/Notification';
import NothingFound from '../shared/NothingFound';
import ProductCard from '../shared/ProductCard';

type Props = {}

export default function Listings({ }: Props) {

  const [items, setItems] = useState<IItem[]>([])
  const [lastItem, setLastItem] = useState<QueryDocumentSnapshot<DocumentData> | undefined>()
  const [hasNextCursor, setHasNextCursor] = useState(true);

  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      if (router.query.uid) {
        const paginatedItems = await getUserItems(router.query.uid as string);
        if (paginatedItems?.itemsArray?.length) {
          const unique = [...items, ...paginatedItems.itemsArray].filter((v, i, a) => a.indexOf(v) === i);
          setLastItem(paginatedItems.lastVisible);
          setItems(unique);
        }
      }
    } catch (error) {
      console.log('error', error);
      openNotificationWithIcon('error', 'Oops!', 'Something went wrong getting the latest documents, please refresh page!')
      if (!items.length) {
        router.push('/500');
      }
    }
  }, [])

  async function fetchMore() {
    try {
      const newItems = await getItems(lastItem);
      setLastItem(newItems.lastVisible);
      setItems((prev) => [...prev, ...newItems.itemsArray])
      if (!newItems.lastVisible) {
        setHasNextCursor(false);
      }
    } catch (error) {
      openNotificationWithIcon('error', 'Oops!', 'Something went wrong getting the latest documents, please refresh page!')
    }
  }

  useEffect(() => {
    fetchData();
  }, [fetchData])


  function renderItems() {
    return items.map((itm, i) => {
      return (
        <div className="m-5" key={i}>
          <Link href={`/item/${itm.uid}/details`}>
            <a>
              <ProductCard image={itm.images ? itm.images[0] : configs.noImage} name={itm.name} address={itm.location.address} itemToExchangeWith={itm.itemToExchangeWith} />
            </a>
          </Link>
        </div>)
    })
  }
  return (
    <div>
      {(items && items.length) ? (
        <InfiniteScroll
          style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}
          dataLength={items.length} //This is important field to render the next data
          next={fetchMore}
          hasMore={hasNextCursor}
          loader={<><CenterLoader /></>}
          endMessage={
            <p style={{ textAlign: 'center' }}>
              <b>Yay! You have seen it all</b>
            </p>
          }
          // below props only if you need pull down functionality
          refreshFunction={fetchMore}
          pullDownToRefresh
          pullDownToRefreshThreshold={50}
          pullDownToRefreshContent={
            <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
          }
          releaseToRefreshContent={
            <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
          }
        >
          <div className="flex content-center justify-center flex-wrap">
            {renderItems()}
          </div>
        </InfiniteScroll>
        // <div className="flex flex-wrap justify-center">
        //   {renderItems()}
        // </div>
      ) : (
        <div>
          <NothingFound />
        </div>
      )}
    </div>
  )
}