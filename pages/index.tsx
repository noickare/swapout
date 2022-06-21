import { EditOutlined, EllipsisOutlined, EnvironmentOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Button, Card } from 'antd';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import type { NextPage } from 'next'
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
// import InfiniteScroll from 'react-infinite-scroll-component';
import CenterLoader from '../components/loader/CenterLoader';
import { openNotificationWithIcon } from '../components/notification/Notification';
import ProductCard from '../components/shared/ProductCard';
import { IItem } from '../models/item';
import { getItems } from '../services/firestore/item';
import configs from '../shared/configs';
import { convertToMapsLink, truncateString } from '../utils/helpers';
import dynamic from 'next/dynamic'

const InfiniteScroll = dynamic(() => import("react-infinite-scroll-component"), {
ssr: false,
});


const Home: NextPage = () => {

  const [items, setItems] = useState<IItem[]>([])
  const [lastItem, setLastItem] = useState<QueryDocumentSnapshot<DocumentData> | undefined>()
  const [hasNextCursor, setHasNextCursor] = useState(true);
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
  }, [fetchData, router.pathname])

  if (!items.length) {
    return (
      <CenterLoader />
    )
  }


  function renderItems() {
    return items.map((itm, i) => {
      return (
        <div className="m-5" key={i}>
            <Link href={`/item/${itm.uid}/details`}>
              <a>
               <ProductCard itemToExchangeWith={itm.itemToExchangeWith} address={itm.location.address} name={itm.name} image={itm.images ? itm.images[0] : configs.noImage} />
              </a>
            </Link>
        </div>
      )
    })
  }

  return (
    <div className="flex justify-center content-center mt-3 flex-col">
      <div className="flex justify-center content-center flex-wrap">
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
      </div>
      {/* <div>
        <Button type="primary" size="large" onClick={fetchMore}>Load More</Button>
      </div> */}
    </div>
  )
}

export default Home
