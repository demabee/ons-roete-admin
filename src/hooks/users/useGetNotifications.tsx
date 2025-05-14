import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const useUpdateSeenNotifications = (id: any) => {
  return setDoc(
    doc(db, 'notification', id),
    {
      seen: true,
    },
    { merge: true }
  );
};
