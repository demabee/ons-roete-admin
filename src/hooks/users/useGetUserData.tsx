import { getAuth } from 'firebase/auth';
import { doc, DocumentReference, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../firebase/config';

const auth = getAuth();

type LoginType = 'student' | 'client' | 'admin';

interface UserData {
  email: string;
  loginType: LoginType;
  type: string;
  uid: string;
}

export default function useGetUserData(): {
  data: UserData;
} {
  const [user, setUser] = useState<any>();
  useEffect(() => {
    if (auth.currentUser?.uid) {
      const d = doc(db, 'users', auth.currentUser?.uid);
      getDoc(d).then((docSnap) => {
        if (docSnap.exists()) {
          setUser(docSnap.data());
          return docSnap.data();
        }
        console.log('No such document!');
        return null;
      });
    }
  }, []);

  return {
    data: user,
  };
}

export const getReference = async (dat: DocumentReference) => {
  const clubSnapshot = await getDoc(dat).then((cs) => cs.data()).catch((e) => console.log('error getting reference: ', e));
  return clubSnapshot;
};
