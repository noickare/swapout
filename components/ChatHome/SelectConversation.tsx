/* eslint-disable @next/next/no-img-element */
import { FC, useCallback, useState } from "react";
import { IMAGE_PROXY } from "../../shared/constants";
import Skeleton from "../Skeleton";
import { useLastMessage } from "../../hooks/useLastMessage";
import { IConversation } from "../../models/conversation";
import { useUsersInfo } from "../../hooks/useUsersInfo";
import { useAuth } from "../../context/authContext";
import { useRouter } from "next/router";
import Link from "next/link";
import { getItem, getItemConversations } from "../../services/firestore/item";
import { openNotificationWithIcon } from "../notification/Notification";
import { IItem } from "../../models/item";

interface SelectConversationProps {
  conversation: IConversation;
  conversationId: string;
}

const SelectConversation: FC<SelectConversationProps> = ({
  conversation,
  conversationId,
}) => {
  const { data: users, loading } = useUsersInfo(conversation.users);
  const { authUser } = useAuth();

  const filtered = users?.filter((user) => user.id !== authUser?.uid);
  const [item, setItem] = useState<IItem | undefined>()

  const router = useRouter();


  const fetchData = useCallback(async () => {
    const uid = router.query.itemId;
    if (uid) {
      try {
        const itemData = await getItem(uid as string);
        setItem(itemData);
      } catch (error: any) {
        console.log(error);
        if (error.message.includes('Item not found')) {
          router.push('/404');
        } else {
          router.push('/500');
          openNotificationWithIcon('error', 'Internal server error', 'An Error ocurred while fetching latest data. Please refresh the page!')
        }
      }
    }

  }, [router.query.itemId])


  const {
    data: lastMessage,
    loading: lastMessageLoading,
    error: lastMessageError,
  } = useLastMessage(conversationId, conversation.itemId && conversation.itemId);



  if (loading)
    return (
      <div className="flex items-stretch gap-2 py-2 px-5">
        <Skeleton className="h-14 w-14 flex-shrink-0 rounded-full" />
        <div className="flex flex-grow flex-col items-start gap-2 py-2">
          <Skeleton className="w-1/2 flex-grow" />
          <Skeleton className="w-2/3 flex-grow" />
        </div>
      </div>
    );

  if (conversation.users.length === 2)
    return (
      <Link
        href={`/item/${conversation.itemId}/conversations/${conversationId}`}
        className={`hover:bg-dark-lighten relative flex items-stretch m-5 gap-2 py-2 px-5 transition duration-300 ${conversationId === router.query.conversationId ? "!bg-[#263342]" : ""
          }`}
      >
        <a>
          <img
            className="h-14 w-14 flex-shrink-0 rounded-full object-cover"
            src={IMAGE_PROXY(filtered?.[0]?.data()?.avatar)}
            alt=""
          />
          <div className="flex flex-grow flex-col items-start gap-1 py-1">
            <p className="max-w-[240px] flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
              {filtered?.[0].data()?.name || filtered?.[0].data()?.email.substring(0, 3)}
            </p>
            {lastMessageLoading ? (
              <Skeleton className="w-2/3 flex-grow" />
            ) : (
              <p className="max-w-[240px] flex-grow overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-400">
                {lastMessage?.message}
              </p>
            )}
          </div>
          {(!lastMessageLoading && !filtered?.length) && (
            <>
              {lastMessage?.lastMessageId !== null &&
                lastMessage?.lastMessageId !==
                conversation.seen[authUser?.uid as string] && (
                  <div className="bg-primary absolute top-1/2 right-4 h-[10px] w-[10px] -translate-y-1/2 rounded-full">No messages yet</div>
                )}
            </>
          )}
        </a>
      </Link>
    );

  return (
    <Link
      href={`/${conversationId}`}
      className={`hover:bg-dark-lighten group relative flex items-stretch gap-2 py-2 px-5 transition duration-300 ${conversationId === router.query.conversationId ? "!bg-[#252F3C]" : ""
        }`}
    >
      <a>
        {conversation?.group?.groupImage ? (
          <img
            className="h-14 w-14 flex-shrink-0 rounded-full object-cover"
            src={conversation.group.groupImage}
            alt=""
          />
        ) : (
          <div className="relative h-14 w-14">
            <img
              className="absolute top-0 right-0 h-10 w-10 flex-shrink-0 rounded-full object-cover"
              src={IMAGE_PROXY(filtered?.[0]?.data()?.photoURL)}
              alt=""
            />
            <img
              className={`border-dark group-hover:border-dark-lighten absolute bottom-0 left-0 z-[1] h-10 w-10 flex-shrink-0 rounded-full border-[3px] object-cover transition duration-300 ${conversationId === router.query.conversationId ? "!border-[#252F3C]" : ""
                }`}
              src={IMAGE_PROXY(filtered?.[1]?.data()?.photoURL)}
              alt=""
            />
          </div>
        )}
        <div className="flex flex-grow flex-col items-start gap-1 py-1">
          <p className="max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap">
            {conversation?.group?.groupName ||
              filtered
                ?.map((user) => user.data()?.name || user.data()?.email.substring(0, 3))
                .slice(0, 3)
                .join(", ")}
          </p>
          {lastMessageLoading ? (
            <Skeleton className="w-2/3 flex-grow" />
          ) : (
            <p className="max-w-[240px] flex-grow overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-400">
              {lastMessage?.message}
            </p>
          )}
        </div>
        {!lastMessageLoading && (
          <>
            {lastMessage?.lastMessageId !== null &&
              lastMessage?.lastMessageId !==
              conversation.seen[authUser?.uid as string] && (
                <div className="bg-primary absolute top-1/2 right-4 h-[10px] w-[10px] -translate-y-1/2 rounded-full"></div>
              )}
          </>
        )}
      </a>
    </Link>
  );
};

export default SelectConversation;
