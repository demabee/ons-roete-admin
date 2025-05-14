import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { db } from '../../firebase/config';

const auth = getAuth();

export default function useGetStudentDocu(): any {
  const [user, setUser] = useState<any>();
  const refetch = useCallback((id: string) => {
    function fetchData() {
      if (auth.currentUser?.uid) {
        console.log(auth.currentUser?.uid);
        const d = doc(db, 'documents', id);
        getDoc(d).then((docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data());
            return docSnap.data();
          }
          console.log('No such document!');
          return null;
        });
      }
    }
    fetchData();
  }, []);

  return {
    data: user,
    fetchData: refetch,
  };
}
