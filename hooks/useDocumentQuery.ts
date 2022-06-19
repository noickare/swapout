import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  onSnapshot,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {useRouter} from 'next/router';

let cache: { [key: string]: any } = {};

export const useDocumentQuery = (
  key: string,
  document: DocumentReference<DocumentData>
) => {
  const [data, setData] = useState<DocumentSnapshot<DocumentData> | null>(
    cache[key] || null
  );
  const [loading, setLoading] = useState(!Boolean(data));
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
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
    // eslint-disable-next-line
  }, [key]);


  return { loading, error, data };
};