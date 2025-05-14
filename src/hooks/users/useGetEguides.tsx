import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { db } from '../../firebase/config';

export default function useGetEguides(): any {
  const [checklist, setChecklist] = useState<any>();

  const refetch = useCallback((id: string) => {
    function fetchData() {
      const d = doc(db, 'files', id);
      getDoc(d).then((docSnap) => {
        if (docSnap.exists()) {
          setChecklist(docSnap.data());
          return docSnap.data();
        } else {
          setChecklist(null);
        }
      });
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data: checklist,
    fetchData: refetch,
  };
}

export function useGetAllEguides(): any {
  const [user, setUser] = useState<any>();
  const [ids, setIds] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const refetch = useCallback((coll = 'files') => {
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
