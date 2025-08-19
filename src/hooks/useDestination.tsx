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
import { DestinationType } from '../types/Destination';

export default function useDestination() {
  const [data, setData] = useState<DestinationType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const galleryRef = collection(db, 'destination');

  const getAll = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(galleryRef);
      const result: DestinationType[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as DestinationType[];
      setData(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'destination', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as DestinationType;
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: Omit<DestinationType, 'id'>) => {
    setLoading(true);
    try {
      const docRef = await addDoc(galleryRef, payload);
      return docRef.id;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, payload: Partial<DestinationType>) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'destination', id);
      await updateDoc(docRef, payload);
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'destination', id);
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
