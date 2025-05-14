import {
  collection,
  getDocs,
} from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { db } from '../../firebase/config';

export default function useGetPayments(): any {
  const [payment, setPayment] = useState<any>();
  const [ids, setIds] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const refetch = useCallback(() => {
    async function fetchData() {
      setLoading(true);
      const docRef = collection(db, 'payments');

      await getDocs(docRef).then((docSnap) => {
        const databaseInfo: any[] = [];
        const dataIds: any[] = [];

        docSnap.forEach(async (doc) => {
          databaseInfo.push({
            ...doc.data(),
            id: doc.id,
          });

          dataIds.push(doc.id);
        });

        setIds(dataIds);
        setPayment(databaseInfo);
      });
      setLoading(false);
    }
    fetchData();
  }, []);

  return {
    data: payment,
    ids,
    fetchData: refetch,
    loading,
  };
}
