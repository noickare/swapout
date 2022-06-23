import { EnvironmentOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { Avatar, Button, Modal, Tabs, Typography } from 'antd'
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react'
import { openNotificationWithIcon } from '../../components/notification/Notification';
import Listings from '../../components/profile/Listings';
import { IUser } from '../../models/user';
import { getUser } from '../../services/firestore/users';
import configs from '../../shared/configs';
import { convertToMapsLink } from '../../utils/helpers';
import Share from '../../components/shared/Share';
import { GenerateSiteTags } from '../../utils/generateSiteTags';
import { useAuth } from '../../context/authContext';
import UpdateUserProfile, { IAdress } from '../../components/modals/UpdateUserProfile';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../../services/init_firebase';
import { ILocation } from '../../models/location';

const { Title, Text } = Typography;
const { TabPane } = Tabs;


export default function UserProfile() {

  const router = useRouter();
  const [userData, setUserData] = useState<IUser>();
  const { authUser } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      if (router.query.uid) {
        const user = await getUser(router.query.uid as string);
        console.log('userData', userData)
        setUserData(user);
      }
    } catch (error) {
      openNotificationWithIcon('error', 'Oops!', 'Something went wrong getting the latest data, please refresh page!')
      if (!userData) {
        router.push('/500');
      }
    }
  }, [router, userData])

  useEffect(() => {
    fetchData();
  }, [fetchData])


  const onFinish = async (values: any, address?: IAdress, avatar?: string) => {
    if (!authUser) {
      router.push('/login')
    } else {
      setIsSubmitting(true);
      try {
        if (userData) {
          console.log
          await updateDoc(doc(firestore, "users", authUser.uid), {
            uid: userData.uid,
            email: values.email,
            name: values.name,
            username: values.username,
            bio: values.bio,
            updatedAt: serverTimestamp(),
            lastLoginTime: userData.lastLoginTime,
            isEmailVerified: userData.isEmailVerified,
            createdAt: userData.createdAt,
            location: address?.lat ? {
              lat: address?.lat as number,
              lng: address?.lng as number,
              address: address?.address as string,
            } : null,
            avatar: avatar || userData.avatar
          });
        }
        await fetchData()
        setEditModalVisible(false)
        setIsSubmitting(false);
      } catch (error) {
        console.log(error);
        setIsSubmitting(false);
        openNotificationWithIcon('error', 'Update Failed', 'An Error ocurred during submission please try again!')
      }
    }
  };


  return (
    <>
      <GenerateSiteTags title={userData?.name || "profile"} description={userData?.bio || ""} image={userData?.avatar || configs.noImage} url={`${process.env.NEXT_PUBLIC_URL}/profile/${userData?.uid}}` || `http://clueswap.com/profile/${userData?.uid}`} />
      <div className="my-20">
        <div className="flex content-center flex-wrap justify-center">
          <div className="mx-10 content-center">
            <Avatar
              size={128}
              src={userData?.avatar || configs.noImage}
            />
          </div>
          <div className="content-center items-center flex flex-col justify-center">
            <div className="flex flex-col w-full items-center">
              <div className="flex content-center items-center">
                <Title level={5}>{userData?.name || "Nameless"}</Title>
              </div>
              <div className="flex content-center items-center">
                <Text>{userData?.bio}</Text>
              </div>
              <div>
                <EnvironmentOutlined />
                <p className="sr-only">Location</p>
                {
                  userData?.location && (
                    <Link href={convertToMapsLink(userData?.location?.address || "")}>
                      <a target="_blank" className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500">{userData.location.address}</a>
                    </Link>
                  )
                }
              </div>
              <div className="flex flex-wrap items-center">
                <div className="my-5">
                  <Share url={process.env.NEXT_PUBLIC_URL ? `${process.env.NEXT_PUBLIC_URL}/profile/${userData?.uid}` : `https://clueswap.com/profile/${userData?.uid}`} title={userData?.name || "Clueswap User"} />
                </div>
                {userData?.uid == authUser?.uid && (
                  <div className="ml-20">
                    <Button onClick={() => setEditModalVisible(true)} type="primary" size="middle" shape="round">Edit</Button>
                  </div>
                )
                }
              </div>
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
      </div>
      <Modal
        title={null}
        centered
        visible={editModalVisible}
        onOk={() => setEditModalVisible(false)}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <UpdateUserProfile userData={userData} onFinish={onFinish} isSubmitting={isSubmitting} add={userData?.location} />
      </Modal>
    </>
  )
}
