import { FC, useState } from "react";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";

import Alert from "../Alert";
import { IMAGE_PROXY } from "../../shared/constants";
import { IConversation } from "../../models/conversation";
import { useRouter } from "next/router";
import { useAuth } from "../../context/authContext";
import { useUsersInfo } from "../../hooks/useUsersInfo";
import { firestore } from "../../services/init_firebase";
import { Spin } from "antd";
import { IUser } from "../../models/user";

interface MembersProps {
  conversation: IConversation;
}

const Members: FC<MembersProps> = ({ conversation }) => {
  const router = useRouter();
  const {uid} = router.query;


  const {authUser} = useAuth()

  const { data, loading, error } = useUsersInfo(conversation.users);


  const [isAlertOpened, setIsAlertOpened] = useState(false);
  const [alertText, setAlertText] = useState("");

  const handleRemoveFromGroup = (uid: string) => {
    if (
      conversation.group?.admins.length === 1 &&
      conversation.group.admins[0] === uid
    ) {
      setAlertText("You must set another one to be an admin");
      setIsAlertOpened(true);
    } else {
      updateDoc(doc(firestore, "conversations", uid as string), {
        users: arrayRemove(uid),
        "group.admins": arrayRemove(uid),
        "group.groupImage": conversation.group?.groupImage,
        "group.groupName": conversation.group?.groupName,
      });

      if (authUser?.uid === uid) {
        router.push("/conversations");
      }
    }
  };

  const handleMakeAdmin = (uid: string) => {
    updateDoc(doc(firestore, "conversations", uid as string), {
      "group.admins": arrayUnion(uid),
      "group.groupImage": conversation.group?.groupImage,
      "group.groupName": conversation.group?.groupName,
    });
    setIsAlertOpened(true);
    setAlertText("Done making an admin");
  };

  if (loading || error)
    return (
      <div className="flex h-80 items-center justify-center">
        <Spin />
      </div>
    );

  return (
    <>
      <div className="flex h-80 flex-col items-stretch gap-4 overflow-y-auto overflow-x-hidden py-4">
        {data
          ?.map((item) => item.data() as IUser)
          .map((user) => (
            <div key={user.uid} className="flex items-center gap-3 px-4">
              <img
                className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                src={IMAGE_PROXY(user.avatar as string)}
                alt=""
              />

              <div className="flex-grow">
                <h1>{user.name}</h1>
              </div>

              {conversation.group?.admins?.includes(
                authUser?.uid as string
              ) && (
                <div className="group relative flex-shrink-0" tabIndex={0}>
                  <button>
                    <i className="bx bx-dots-horizontal-rounded text-2xl"></i>
                  </button>

                  <div className="bg-dark-lighten border-dark-lighten invisible absolute top-full right-0 z-[1] flex w-max flex-col items-stretch rounded-lg border py-1 opacity-0 transition-all duration-300 group-focus-within:!visible group-focus-within:!opacity-100">
                    {conversation.users.length > 3 && (
                      <button
                        onClick={() => handleRemoveFromGroup(user.uid)}
                        className="bg-dark-lighten flex items-center gap-1 px-3 py-1 transition duration-300 hover:brightness-125"
                      >
                        <i className="bx bx-user-x text-2xl"></i>
                        <span>
                          {user.uid === authUser?.uid
                            ? "Leave group"
                            : "Kick from group"}
                        </span>
                      </button>
                    )}
                    {user.uid !== authUser?.uid && (
                      <button
                        onClick={() => handleMakeAdmin(user.uid)}
                        className="bg-dark-lighten flex items-center gap-1 px-3 py-1 transition duration-300 hover:brightness-125"
                      >
                        <i className="bx bx-user-check text-2xl"></i>
                        <span>Make an admin</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>

      <Alert
        isOpened={isAlertOpened}
        setIsOpened={setIsAlertOpened}
        text={alertText}
      />
    </>
  );
};

export default Members;
