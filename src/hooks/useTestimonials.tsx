/* eslint-disable react-hooks/exhaustive-deps */
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { db } from '../firebase/config';
import { TestimonialType } from '../types/Testimonial';

export default function useTestimonials() {
  const [data, setData] = useState<TestimonialType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const interestRef = collection(db, 'testimonial');

  const getAll = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(interestRef);
      const result: TestimonialType[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as TestimonialType[];
      setData(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'testimonial', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as TestimonialType;
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: Omit<TestimonialType, 'id'>) => {
    setLoading(true);
    try {
      const docRef = await addDoc(interestRef, payload);
      return docRef.id;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, payload: Partial<TestimonialType>) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'testimonial', id);
      await updateDoc(docRef, payload);
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'testimonial', id);
      await deleteDoc(docRef);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    getAll,
    getById,
    create,
    update,
    remove,
  };
}
