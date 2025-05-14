import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { db } from '../../firebase/config';

const auth = getAuth();

export default function useGetStudentData(): any {
  const [user, setUser] = useState<any>();
  const refetch = useCallback(() => {
    function fetchData() {
      if (auth.currentUser?.uid) {
        const docRef = collection(db, 'students');
        const q = query(docRef, where('userId', '==', auth.currentUser?.uid));
        getDocs(q).then((docSnap) => {
          docSnap.forEach((doc) => {
            if (doc.exists()) {
              setUser(doc.data());
              return doc.data();
            }
            console.log('No such document!');
            return null;
          });
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

export function useGetStudentAccommodatie(): any {
  const [user, setUser] = useState<any>();
  const refetch = useCallback((id: string) => {
    function fetchData() {
      if (auth.currentUser?.uid) {
        const d = doc(db, 'accommodatiebemiddeling', id);
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
