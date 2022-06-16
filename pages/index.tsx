import { EditOutlined, EllipsisOutlined, EnvironmentOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Button, Card } from 'antd';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import type { NextPage } from 'next'
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import CenterLoader from '../components/loader/CenterLoader';
import { openNotificationWithIcon } from '../components/notification/Notification';
import { IItem } from '../models/item';
import { getItems } from '../services/firestore/item';
import { convertToMapsLink, truncateString } from '../utils/helpers';


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
      console.log('new items', newItems)
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

  if (!items.length) {
    return (
      <CenterLoader />
    )
  }

  console.log(items);

  function renderItems() {
    return items.map((itm, i) => {
      return (
        <div className="m-5" key={i}>
          <Card>
            <Link href={`/item/${itm.uid}/details`}>
              <a>
                <div className="py-6">
                  <div className="flex max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="w-1/3 bg-cover" style={{ backgroundImage: `url(${itm.images && itm.images[0]})` }}>
                    </div>
                    <div className="w-2/3 p-4">
                      <h1 className="text-gray-900 font-bold text-2xl">{itm.name}</h1>
                      <p className="mt-2 text-gray-600 text-sm">{truncateString(itm.description, 100)}</p>
                      <div className="flex item-center mt-2">
                        <div className="flex items-center">
                          <EnvironmentOutlined />
                          <p className="sr-only">Location</p>
                          <Link href={convertToMapsLink(itm.location.address)}>
                            <a target="_blank" className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500">{itm.location.address}</a>
                          </Link>
                        </div>
                      </div>
                      <div className="flex item-center justify-between mt-3">
                        <div>
                          <h3 className="text-lg text-gray-600 font-medium">Exchange item:</h3>

                          <fieldset className="mt-4">
                            <legend className="sr-only">Exchange item</legend>
                            <div className="flex items-center space-x-3">
                              <p className="text-base text-gray-900">{itm.itemToExchangeWith}</p>
                            </div>
                          </fieldset>
                        </div>
                        {/* <h1 className="text-gray-700 font-bold text-xl">$220</h1> */}
                        {/* <button className="px-3 py-2 bg-gray-800 text-white text-xs font-bold uppercase rounded">Add to Card</button> */}
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            </Link>
          </Card>
        </div>
      )
    })
  }

  return (
    <div className="flex justify-center content-center mt-20 flex-col">
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
