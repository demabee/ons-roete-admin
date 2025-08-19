/* eslint-disable react-hooks/exhaustive-deps */
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { db } from '../firebase/config';

export type NodeType = {
  id: string;
  name: string;
  description?: string;
};

export default function useNodes() {
  const [data, setData] = useState<NodeType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const nodesRef = collection(db, 'nodes');

  const getAll = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(nodesRef);
      const result: NodeType[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as NodeType[];
      setData(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'nodes', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as NodeType;
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: Omit<NodeType, 'id'>) => {
    setLoading(true);
    try {
      const docRef = await addDoc(nodesRef, payload);
      return docRef.id;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (id: string, payload: Partial<NodeType>) => {
      setLoading(true);
      try {
        const docRef = doc(db, 'nodes', id);
        await updateDoc(docRef, payload);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'nodes', id);
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
