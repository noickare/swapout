import { doc, DocumentData, DocumentSnapshot, onSnapshot } from 'firebase/firestore';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { useMediaQuery } from 'react-responsive';
import ChatHeader from '../../../../components/Chat/ChatHeader';
import ChatView from '../../../../components/Chat/ChatView';
import SideBar from '../../../../components/ChatHome/SideBar'
import InputSection from '../../../../components/Input/InputSection';
import CenterLoader from '../../../../components/loader/CenterLoader';
import { useAuth } from '../../../../context/authContext';
import { useIsConversationScreen } from '../../../../context/isConversationScreen';
import { useDocumentQuery } from '../../../../hooks/useDocumentQuery';
import { IConversation } from '../../../../models/conversation';
import { firestore } from '../../../../services/init_firebase';
import { GenerateSiteTags } from '../../../../utils/generateSiteTags';

type Props = {}

export default function ConversationPage({ }: Props) {
  const router = useRouter();
  const { itemId, conversationId } = router.query;

  const [inputSectionOffset, setInputSectionOffset] = useState(0);

  const [replyInfo, setReplyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DocumentSnapshot<DocumentData> | null>(null);
  const [error, setError] = useState(false);
  const conversation = data?.data() as IConversation;
  const [pageLoading, setPageLoading] = useState(true);
  const { authUser, authLoading } = useAuth();
  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 1224px)'
  })

  useEffect(() => {
    if (!authUser && !authLoading) {
      router.push('/login');
      setPageLoading(false);
    } else {
      if (itemId && conversationId) {
        setPageLoading(false);
        router.push(`/item/${itemId}/conversations/${conversationId}`);
      }
    }
    if (conversationId) {
      const document = doc(firestore, "items", itemId as string, "conversations", conversationId as string || '')
      const unsubscribe = onSnapshot(
        document,
        (snapshot) => {
          setData(snapshot);
          setLoading(false);
        },
        (err) => {
          console.log(err);
          setData(null);
          setLoading(false);
          setError(true);
        }
      );

      return () => {
        unsubscribe();
      };
    }
    // eslint-disable-next-line
  }, [conversationId]);


  if (pageLoading) return (
    <>
      <CenterLoader />
    </>
  )



  return (
    <>
      <GenerateSiteTags title="conversations" description="" image="" url={`${process.env.NEXT_PUBLIC_URL}` || `http://clueswap.vercel.app`} />
      <div className="flex flex-grow items-stretch">
        {
          isDesktopOrLaptop && (
            <SideBar />
          )
        }
        <div className="flex flex-grow flex-col items-stretch h-screen">
          {loading ? (
            <>
              <div className="border-dark-lighten h-20 border-b"></div>
              <div className="flex-grow"></div>
              <InputSection disabled />
            </>
          ) : !conversation ||
            error ||
            !conversation.users.includes(authUser?.uid as string) ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-6">
              <Image className="h-32 w-32 object-cover" src="/error.svg" alt="" />
              <p className="text-center text-lg">Conversation does not exists</p>
            </div>
          ) : (
            <>
              {/* <ChatHeader conversation={conversation} /> */}
              <ChatView
                replyInfo={replyInfo}
                setReplyInfo={setReplyInfo}
                inputSectionOffset={inputSectionOffset}
                conversation={conversation}
              />
              <InputSection
                setInputSectionOffset={setInputSectionOffset}
                replyInfo={replyInfo}
                setReplyInfo={setReplyInfo}
                disabled={false}
              />
            </>
          )}
        </div>
      </div>
    </>
  )
}