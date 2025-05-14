import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import { db } from '../../firebase/config';

export default function useGetAllMessages(): any {
  const [user, setUser] = useState<any>();
  const [ids, setIds] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const refetch = useCallback(() => {
    async function fetchData() {
      setLoading(true);
      const docRef = collection(db, 'students');

      await getDocs(docRef).then((docSnap) => {
        const databaseInfo: any[] = [];
        const dataIds: string[] = [];

        docSnap.forEach((doc) => {
          databaseInfo.push({
            ...doc.data(),
            id: doc.id,
          });
          dataIds.push(doc.id);
        });

        setIds(dataIds);
        setUser(databaseInfo);
      });
      setLoading(false);
    }
    fetchData();
  }, []);

  return {
    data: user,
    ids,
    fetchData: refetch,
    loading,
  };
}

export function useGetGenMessages() {
  const [user, setGenMessages] = useState<any>();

  useEffect(() => {
    const unsubscribeFromAuthStatuChanged = onSnapshot(
      query(
        collection(db, 'messages'),
        where('receiver', 'in', ['admin']),
        where('type', '==', 'general')
      ),
      (snapshot) => {
        const messages: any = snapshot.docs.map((doc) => ({
          ...doc.data(),
          createdAt: doc.data().createdAt
            ? moment(doc.data().createdAt.toDate())
            : moment(),
        }));
        setGenMessages(
          (messages ?? [])
            .sort(
              (a: any, b: any) =>
                Date.parse(b.createdAt) - Date.parse(a.createdAt)
            )
            .filter((c: any) => c?.seen !== true)
        );
      }
    );

    return unsubscribeFromAuthStatuChanged;
  }, []);

  return {
    user,
    // userData,
  };
}

export function useGetUrgentMessages() {
  const [user, setGenMessages] = useState<any>();

  useEffect(() => {
    const unsubscribeFromAuthStatuChanged = onSnapshot(
      query(
        collection(db, 'messages'),
        where('receiver', 'in', ['admin']),
        where('type', '==', 'urgent')
      ),
      (snapshot) => {
        const messages: any = snapshot.docs.map((doc) => ({
          ...doc.data(),
          createdAt: doc.data().createdAt
            ? moment(doc.data().createdAt.toDate())
            : moment(),
        }));
        setGenMessages(
          (messages ?? [])
            .sort(
              (a: any, b: any) =>
                Date.parse(b.createdAt) - Date.parse(a.createdAt)
            )
            .filter((c: any) => c?.seen !== true)
        );
      }
    );

    return unsubscribeFromAuthStatuChanged;
  }, []);

  return {
    user,
  };
}
