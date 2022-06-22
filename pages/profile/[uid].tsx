import { EnvironmentOutlined, ShareAltOutlined, UnorderedListOutlined, UserOutlined, WechatOutlined } from '@ant-design/icons'
import { Avatar, Button, Divider, Menu, Tabs, Typography } from 'antd'
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react'
import {
  LineShareButton,
  LineIcon,
} from 'next-share';
import { openNotificationWithIcon } from '../../components/notification/Notification';
import Conversations from '../../components/profile/Conversations';
import Listings from '../../components/profile/Listings';
import { IUser } from '../../models/user';
import { getUser } from '../../services/firestore/users';
import configs from '../../shared/configs';
import { convertToMapsLink } from '../../utils/helpers';
import Share from '../../components/shared/Share';
import { GenerateSiteTags } from '../../utils/generateSiteTags';

const { Title } = Typography;
const { TabPane } = Tabs;


export default function UserProfile() {

  const router = useRouter();
  const [userData, setUserData] = useState<IUser>();

  const fetchData = useCallback(async () => {
    try {
      if (router.query.uid) {

        const user = await getUser(router.query.uid as string);
        setUserData(user);
      }
    } catch (error) {
      openNotificationWithIcon('error', 'Oops!', 'Something went wrong getting the latest data, please refresh page!')
      if (!userData) {
        router.push('/500');
      }
    }
  }, [router.query.uid])

  useEffect(() => {
    fetchData();
  }, [fetchData])

  return (
    <>
      <GenerateSiteTags title={userData?.name || "profile"} description={userData?.bio || ""} image={userData?.avatar || configs.noImage} url={`${process.env.NEXT_PUBLIC_URL}/profile/${userData?.uid}}` || `http://clueswap.com/profile/${userData?.uid}`} />
      <div className="m-20">
        <div className="flex items-center content-center">
          <Avatar
            size={128}
            src={userData?.avatar || configs.noImage}
          />
          <div className="m-5">
            <Title level={5}>{userData?.name || "Nameless"}</Title>
            <EnvironmentOutlined />
            <p className="sr-only">Location</p>
            <Link href={convertToMapsLink(userData?.location?.address || "")}>
              <a target="_blank" className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500">staten island Ny</a>
            </Link>
            <div className="my-5">
              <Share />
            </div>
          </div>
        </div>
        <div>
          <Tabs centered defaultActiveKey="2" size="large" type="card">
            <TabPane
              tab={
                <span>
                  <UnorderedListOutlined />
                  Listed
                </span>
              }
              key="1"
            >
              <Listings />
            </TabPane>
            {/* <TabPane
            tab={
              <span>
                <WechatOutlined />
                Conversations
              </span>
            }
            key="2"
          >
            <Conversations />
          </TabPane> */}
          </Tabs>
        </div>
        <div className="mt-20">
          <Divider />
        </div>
      </div>
    </>
  )
}
