import { Spin } from 'antd';
import { collection, DocumentData, onSnapshot, orderBy, QuerySnapshot, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import SelectConversation from '../../../../components/ChatHome/SelectConversation';
import CenterLoader from '../../../../components/loader/CenterLoader';
import { useAuth } from '../../../../context/authContext';
import { IConversation } from '../../../../models/conversation';
import { firestore } from '../../../../services/init_firebase';

type Props = {}

export default function ConversationList({ }: Props) {
    const [data, setData] = useState<QuerySnapshot<DocumentData> | null>(null);
    const { authUser } = useAuth();
    const [loading, setLoading] = useState(!data);
    const [error, setError] = useState(false);

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
            <CenterLoader />
        </div>
    }
    console.log('convs', data?.docs)

    return (
        <div>
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
    )
}