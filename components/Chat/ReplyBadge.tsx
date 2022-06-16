import { FC, useState } from "react";

import Alert from "../Alert";
import { doc } from "firebase/firestore";
import { useDocumentQuery } from "../../hooks/useDocumentQuery";
import { useRouter } from "next/router";
import { firestore } from "../../services/init_firebase";

interface ReplyBadgeProps {
  messageId: string;
}

const ReplyBadge: FC<ReplyBadgeProps> = ({ messageId }) => {
  const router = useRouter();
  const {uid} = router.query;

  const [isAlertOpened, setIsAlertOpened] = useState(false);

  const { data, loading, error } = useDocumentQuery(
    `message-${messageId}`,
    doc(firestore, "conversations", uid as string, "messages", messageId)
  );

  if (loading || error)
    return <div className="h-10 w-20 rounded-lg bg-[#4E4F50]"></div>;

  return (
    <>
      <div
        onClick={() => {
          const el = document.querySelector(`#message-${messageId}`);
          if (el) el.scrollIntoView({ behavior: "smooth" });
          else setIsAlertOpened(true);
        }}
        className="cursor-pointer rounded-lg bg-[#4E4F50] p-2 opacity-60"
      >
        {data?.data()?.type === "text" ? (
          <p>{data?.data()?.content}</p>
        ) : data?.data()?.type === "image" ? (
          "An image"
        ) : data?.data()?.type === "file" ? (
          "A file"
        ) : data?.data()?.type === "sticker" ? (
          "A sticker"
        ) : (
          "Message has been removed"
        )}
      </div>
      <Alert
        isOpened={isAlertOpened}
        setIsOpened={setIsAlertOpened}
        text="Cannot find your message. Try to scroll up to load more"
      />
    </>
  );
};

export default ReplyBadge;
