import { collection, getDocs } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { db } from '../../firebase/config';

export default function useGetRequests(): any {
  const [user, setUser] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const refetch = useCallback((coll = 'requests') => {
    async function fetchData() {
      setLoading(true);
      const docRef = collection(db, coll);

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

        setUser((databaseInfo || []).filter((item) => !!item?.createdAt));
      });
      setLoading(false);
    }
    fetchData();
  }, []);

  return {
    data: user,
    fetchData: refetch,
    loading,
  };
}
