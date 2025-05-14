import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const useCreateStudentData = (studentData: any) => {
  // const studentsColRef = collection(db, 'students');
  // return addDoc(studentsColRef, {
  //   ...studentData,
  //   created: serverTimestamp(),
  // });

  return setDoc(doc(db, 'students', studentData.userId), {
    ...studentData,
    created: serverTimestamp(),
  });
};

export const useUpdateStudentData = (studentData: any) => {
  return setDoc(
    doc(db, 'students', studentData.userId),
    {
      ...studentData,
    },
    { merge: true }
  );
};
