/* eslint-disable react-hooks/exhaustive-deps */
import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  doc
} from "firebase/firestore";
import { useCallback, useState } from "react";
import { db } from "../firebase/config";

export interface HeroType {
  id: string;
  videoUrl?: string;
  heroTitle?: string;
  heroDescription?: string;
  quote?: string;
}

export default function useHero() {
  const [data, setData] = useState<HeroType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const heroRef = collection(db, "hero");

  const getHero = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(heroRef);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const heroData = { id: docSnap.id, ...docSnap.data() } as HeroType;
        setData(heroData);
        return heroData;
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, "hero", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as HeroType;
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrUpdate = useCallback(
    async (id: string | null, payload: Omit<HeroType, "id">) => {
      setLoading(true);
      try {
        if (id) {
          const docRef = doc(db, "hero", id);
          await updateDoc(docRef, payload);
        } else {
          const newDocRef = doc(heroRef);
          await setDoc(newDocRef, payload);
          return newDocRef.id;
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    data,
    loading,
    getHero,
    getById,
    createOrUpdate,
  };
}
