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



  useEffect(() => {
    if(authUser) {
      const unsubscribe = onSnapshot(
        query(collection(firestore, "conversations"), orderBy("updatedAt", "desc"), where("users", "array-contains", authUser?.uid)),
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

  console.log({data, error, loading, empty: data?.empty, docs: data?.docs, authUser: authUser?.uid})

  const router = useRouter();
  const { uid } = router.query


  if (!authUser || loading) {
    <div className="my-6 flex justify-center">
      <Spin />
    </div>
  }

  return (
    <>
      <div
        className={`border-dark-lighten h-screen flex-shrink-0 overflow-y-auto overflow-x-hidden border-r ${!uid
          ? "hidden w-[350px] md:!block"
          : "w-full md:!w-[350px]"
          }`}
      >
        <div className="border-dark-lighten flex h-20 items-center justify-between border-b px-6">

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCreateConversationOpened(true)}
              className="bg-dark-lighten h-8 w-8 rounded-full"
            >
              <i className="bx bxs-edit text-xl"></i>
            </button>

            <ClickAwayListener onClickAway={() => setIsDropdownOpened(false)}>
              {(ref) => (
                <div ref={ref} className="relative z-10">
                  <img
                    onClick={() => setIsDropdownOpened((prev) => !prev)}
                    className="h-8 w-8 cursor-pointer rounded-full object-cover"
                    src={
                      authUser?.avatar
                        ? IMAGE_PROXY(authUser.avatar)
                        : DEFAULT_AVATAR
                    }
                    alt=""
                  />

                  <div
                    className={`border-dark-lighten bg-dark absolute top-full right-0 flex w-max origin-top-right flex-col items-stretch overflow-hidden rounded-md border py-1 shadow-lg transition-all duration-200 ${isDropdownOpened
                      ? "visible scale-100 opacity-100"
                      : "invisible scale-0 opacity-0"
                      }`}
                  >
                    <button
                      onClick={() => {
                        setIsUserInfoOpened(true);
                        setIsDropdownOpened(false);
                      }}
                      className="hover:bg-dark-lighten flex items-center gap-1 px-3 py-1 transition duration-300"
                    >
                      <i className="bx bxs-user text-xl"></i>
                      <span className="whitespace-nowrap">Profile</span>
                    </button>
                    <button
                      onClick={() => router.push('/')}
                      className="hover:bg-dark-lighten flex items-center gap-1 px-3 py-1 transition duration-300"
                    >
                      <i className="bx bx-log-out text-xl"></i>
                      <span className="whitespace-nowrap">Home</span>
                    </button>
                  </div>
                </div>
              )}
            </ClickAwayListener>
          </div>
        </div>
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
