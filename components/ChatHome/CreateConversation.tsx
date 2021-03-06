import { FC, useState } from "react";
import { IMAGE_PROXY, THEMES } from "../../shared/constants";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { Modal, Spin } from "antd";
import { firestore } from "../../services/init_firebase";
import { useCollectionQuery } from "../../hooks/useCollectionQuery";
import { useAuth } from "../../context/authContext";
import { useRouter } from "next/router";

interface CreateConversationProps {
  setIsOpened: (value: boolean) => void;
  isOpen: boolean;
}

const CreateConversation: FC<CreateConversationProps> = ({ setIsOpened, isOpen }) => {
  const { data, error, loading } = useCollectionQuery(
    "all-users",
    collection(firestore, "users")
  );

  const [isCreating, setIsCreating] = useState(false);

  const { authUser} = useAuth();

  const [selected, setSelected] = useState<string[]>([]);

  const router = useRouter();
  const {itemId, conversationId} = router.query; 

  const handleToggle = (uid: string) => {
    if (selected.includes(uid)) {
      setSelected(selected.filter((item) => item !== uid));
    } else {
      setSelected([...selected, uid]);
    }
  };

  const handleCreateConversation = async () => {
    setIsCreating(true);

    const sorted = [...selected, authUser?.uid].sort();

    const q = query(
      collection(firestore, "conversations"),
      where("users", "==", sorted)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      const created = await addDoc(collection(firestore, "items", itemId as string, "conversations", conversationId as string, "messages"), {
        users: sorted,
        group:
          sorted.length > 2
            ? {
                admins: [authUser?.uid],
                groupName: null,
                groupImage: null,
              }
            : {},
        updatedAt: serverTimestamp(),
        seen: {},
        theme: THEMES[0],
      });

      setIsCreating(false);

      setIsOpened(false);

      router.push(`/item/${itemId}/conversation/${created.id}`)
    } else {
      setIsOpened(false);

      router.push(`/item/${itemId}/conversations/${querySnapshot.docs[0].id}`)

      setIsCreating(false);
    }
  };

  return (
    <Modal
      onCancel={() => setIsOpened(false)}
      visible={isOpen}
      onOk={handleCreateConversation}
      className="fixed top-0 left-0 z-20 flex h-full w-full items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-dark mx-3 w-full max-w-[500px] overflow-hidden rounded-lg"
      >
        <div className="border-dark-lighten flex items-center justify-between border-b py-3 px-3">
          <div className="flex-1"></div>
          <div className="flex flex-1 items-center justify-center">
            <h1 className="whitespace-nowrap text-center text-2xl">
              New conversation
            </h1>
          </div>
          <div className="flex flex-1 items-center justify-end">
            <button
              onClick={() => setIsOpened(false)}
              className="bg-dark-lighten flex h-8 w-8 items-center justify-center rounded-full"
            >
              <i className="bx bx-x text-2xl"></i>
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <Spin />
          </div>
        ) : error ? (
          <div className="flex h-96 items-center justify-center">
            <p className="text-center">Something went wrong</p>
          </div>
        ) : (
          <>
            {isCreating && (
              <div className="absolute top-0 left-0 z-20 flex h-full w-full items-center justify-center bg-[#00000080]">
                <Spin />
              </div>
            )}
            <div className="flex h-96 flex-col items-stretch gap-2 overflow-y-auto py-2">
              {data?.docs
                .filter((doc) => doc.data().uid !== authUser?.uid)
                .map((doc) => (
                  <div
                    key={doc.data().uid}
                    onClick={() => handleToggle(doc.data().uid)}
                    className="hover:bg-dark-lighten flex cursor-pointer items-center gap-2 px-5 py-2 transition"
                  >
                    <input
                      className="flex-shrink-0 cursor-pointer"
                      type="checkbox"
                      checked={selected.includes(doc.data().uid)}
                      readOnly
                    />
                    <img
                      className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                      src={IMAGE_PROXY(doc.data().avatar)}
                      alt=""
                    />
                    <p>{doc.data().name}</p>
                  </div>
                ))}
            </div>
            <div className="border-dark-lighten flex justify-end border-t p-3">
              <button
                disabled={selected.length === 0}
                onClick={handleCreateConversation}
                className="bg-dark-lighten rounded-lg py-2 px-3 transition duration-300 hover:brightness-125 disabled:!brightness-[80%]"
              >
                Start conversation
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default CreateConversation;
