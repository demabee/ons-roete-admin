import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../../firebase/config';

export const useCreatePaymentData = (paymentData: any) => {
  const paymentColRef = collection(db, 'payments');
  return addDoc(paymentColRef, {
    ...paymentData,
    timestamp: serverTimestamp(),
  });
};

export const useUpdatePaymentData = (paymentData: any) => {
  return setDoc(doc(db, 'payments', paymentData.id), {
    ...paymentData,
    issuedTo: doc(db, 'students', paymentData?.issuedTo?.userId),
  });
};
