import { collection, getDocs } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { db } from '../../firebase/config';

export default function useGetTags(): any {
  const [user, setUser] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const refetch = useCallback(() => {
    async function fetchData() {
      setLoading(true);
      const docRef = collection(db, 'tags');

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

        setUser(databaseInfo);
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
