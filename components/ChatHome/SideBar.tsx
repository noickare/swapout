/* eslint-disable @next/next/no-img-element */
import { DEFAULT_AVATAR, IMAGE_PROXY } from "../../shared/constants";
import React, { FC, useEffect, useState } from "react";
import { collection, DocumentData, onSnapshot, orderBy, query, QuerySnapshot, where } from "firebase/firestore";

import { useAuth } from "../../context/authContext";
import { useCollectionQuery } from "../../hooks/useCollectionQuery";
import { firestore } from "../../services/init_firebase";
import { useRouter } from "next/router";
import Link from "next/link";
import ClickAwayListener from "../ClickAwayListener";
import { Spin } from "antd";
import SelectConversation from "./SelectConversation";
import { IConversation } from "../../models/conversation";
import CreateConversation from "./CreateConversation";
import UserInfo from "./UserInfo";

const SideBar: FC = () => {
  const { authUser } = useAuth();

  const [isDropdownOpened, setIsDropdownOpened] = useState(false);
  const [createConversationOpened, setCreateConversationOpened] =
    useState(false);
  const [isUserInfoOpened, setIsUserInfoOpened] = useState(false);
  const [data, setData] = useState<QuerySnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(false);
  const router = useRouter();
  const { itemId, conversationId } = router.query;




  useEffect(() => {
    if (authUser) {
      const unsubscribe = onSnapshot(
        query(collection(firestore, "userConversationList"), orderBy("updatedAt", "desc")),
        (snapshot) => {
          setData(snapshot);
          setLoading(false);
          setError(false);
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

  }, [authUser]);




  if (!authUser || loading) {
    <div className="my-6 flex justify-center">
      <Spin />
    </div>
  }

  return (
    <>
      <div
        className={`border-dark-lighten h-screen flex-shrink-0 overflow-y-auto overflow-x-hidden border-r ${!conversationId
          ? "hidden w-[350px] md:!block"
          : "w-full md:!w-[350px]"
          }`}
      >
        {loading ? (
          <div className="my-6 flex justify-center">
            <Spin />
          </div>
        ) : error ? (
          <div className="my-6 flex justify-center">
            <p className="text-center">Something went wrong</p>
          </div>
        ) : data?.empty ? (
          <div className="my-6 flex flex-col items-center justify-center">
            <p className="text-center">No conversation found</p>
            <button
              onClick={() => setCreateConversationOpened(true)}
              className="text-primary text-center"
            >
              Create one
            </button>
          </div>
        ) : (
          <div>
            {data?.docs.map((item) => (
              <SelectConversation
                key={item.id}
                conversation={item.data() as IConversation}
                conversationId={item.id}
              />
            ))}
          </div>
        )}
      </div>
      {/* {createConversationOpened && ( */}
      <CreateConversation setIsOpened={setCreateConversationOpened} isOpen={createConversationOpened} />

      {/* )} */}

      <UserInfo isOpened={isUserInfoOpened} setIsOpened={setIsUserInfoOpened} />
    </>
  );
};

export default SideBar;
