import { doc, DocumentData, DocumentSnapshot, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import ChatHeader from '../../../../components/Chat/ChatHeader';
import ChatView from '../../../../components/Chat/ChatView';
import SideBar from '../../../../components/ChatHome/SideBar'
import InputSection from '../../../../components/Input/InputSection';
import { useAuth } from '../../../../context/authContext';
import { useIsConversationScreen } from '../../../../context/isConversationScreen';
import { useDocumentQuery } from '../../../../hooks/useDocumentQuery';
import { IConversation } from '../../../../models/conversation';
import { firestore } from '../../../../services/init_firebase';

type Props = {}

export default function ConversationPage({ }: Props) {
  const router = useRouter();
  const { itemId, conversationId } = router.query;


  // eslint-disable-next-line react-hooks/rules-of-hooks
  // const { data, loading, error } = conversationId ? useDocumentQuery(
  //   `conversation-${conversationId || ''}`,
  //   doc(firestore, "items",  itemId as string ,"conversations", conversationId as string || '')
  // ) : { data: undefined, loading: false, error: undefined};

  // const {} = () => {

  // }


  const { authUser } = useAuth();

  const [inputSectionOffset, setInputSectionOffset] = useState(0);

  const [replyInfo, setReplyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DocumentSnapshot<DocumentData> | null>(null);
  const [error, setError] = useState(false);
  const conversation = data?.data() as IConversation;

  useEffect(() => {
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



  return (
    <div className="flex flex-grow items-stretch h-5/6">
      {/* <SideBar /> */}
      <div className="flex flex-grow flex-col items-stretch">
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
            <img className="h-32 w-32 object-cover" src="/error.svg" alt="" />
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
  )
}