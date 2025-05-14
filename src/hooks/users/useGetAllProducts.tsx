import { collection, getDocs, query, where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { db } from '../../firebase/config';

export default function useGetAllProducts(): any {
  const [user, setUser] = useState<any>();
  const [ids, setIds] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const refetch = useCallback((status?: string) => {
    async function fetchData() {
      setLoading(true);
      const docRef =
        status && status !== 'all'
          ? query(
              collection(db, 'nodes'),
              where('status', '==', status ?? 'active')
            )
          : query(collection(db, 'nodes'));

      await getDocs(docRef)
        .then((docSnap) => {
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
        })
        .finally(() => {
          setLoading(false);
        });
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
