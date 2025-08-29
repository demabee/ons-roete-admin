/* eslint-disable react-hooks/exhaustive-deps */
import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useCallback, useState } from "react";
import { db } from "../firebase/config";
import { InterestType } from "../types/Interest";

export default function useInterest() {
  const [data, setData] = useState<InterestType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const interestRef = collection(db, "interest");

  // Fetch all
  const getAll = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(interestRef);
      const result: InterestType[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as InterestType[];
      setData(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get by ID
  const getById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, "interest", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as InterestType;
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: InterestType) => {
    setLoading(true);
    try {
      const docRef = doc(interestRef, payload.id);
      const newPayload = { ...payload };
      await setDoc(docRef, newPayload);
      console.log("✅ Interest created successfully:", newPayload);
      return payload.id;
    } catch (error) {
      console.error("❌ Error creating interest:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update existing document
  const update = useCallback(async (id: string, payload: Partial<InterestType>) => {
    setLoading(true);
    try {
      const docRef = doc(db, "interest", id);
      await updateDoc(docRef, payload);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete document
  const remove = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, "interest", id);
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

