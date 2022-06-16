import {
  arrayUnion,
  collection,
  doc,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { FC } from "react";
import { IMAGE_PROXY } from "../../shared/constants";
import { useRouter } from "next/router";
import { useCollectionQuery } from "../../hooks/useCollectionQuery";
import { firestore } from "../../services/init_firebase";
import { Spin } from "antd";
import { IConversation } from "../../models/conversation";
import { IUser } from "../../models/user";

interface AddMembersProps {
  conversations: IConversation;
}

const AddMembers: FC<AddMembersProps> = ({ conversations }) => {
  const  router = useRouter();
  const { uid } = router.query;

  const { data, loading, error } = useCollectionQuery(
    `all-users-except-${JSON.stringify(conversations.users)}`,
    query(
      collection(firestore, "users"),
      where("uid", "not-in", conversations.users.slice(0, 10))
    )
  );

  const handleAddMember = (uid: string) => {
    updateDoc(doc(firestore, "conversations", uid as string), {
      users: arrayUnion(uid),
    });
  };

  if (loading || error)
    return (
      <div className="flex h-80 items-center justify-center">
        <Spin />
      </div>
    );

  return (
    <div className="flex h-80 flex-col items-stretch gap-4 overflow-y-auto overflow-x-hidden py-4">
      {data?.docs
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
            <button onClick={() => handleAddMember(user.uid)}>
              <i className="bx bx-plus text-2xl"></i>
            </button>
          </div>
        ))}
      {data?.empty && <p className="text-center">No more user to add</p>}
    </div>
  );
};

export default AddMembers;
