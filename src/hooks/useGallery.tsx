/* eslint-disable react-hooks/exhaustive-deps */
import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc
} from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { db } from '../firebase/config';
import { GalleryType } from '../types/Gallery';

export default function useGallery() {
  const [data, setData] = useState<GalleryType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const galleryRef = collection(db, 'gallery');

  const getAll = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(galleryRef);
      const result: GalleryType[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as GalleryType[];
      setData(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'gallery', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as GalleryType;
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: GalleryType) => {
    setLoading(true);
    try {
      const docRef = doc(galleryRef, payload.id);
      const newPayload = { ...payload };
      await setDoc(docRef, newPayload);
      console.log("✅ Gallery created successfully:", newPayload);
      return payload.id;
    } catch (error) {
      console.error("❌ Error creating gallery:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, payload: Partial<GalleryType>) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'gallery', id);
      await updateDoc(docRef, payload);
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'gallery', id);
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
