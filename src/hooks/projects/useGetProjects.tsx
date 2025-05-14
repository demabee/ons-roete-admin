import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { db } from '../../firebase/config';

export default function useGetProjects(): any {
  const [user, setUser] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const refetch = useCallback(() => {
    async function fetchData() {
      setLoading(true);
      const docRef = collection(db, 'maps');

      await getDocs(docRef).then((docSnap) => {
        const databaseInfo: any[] = [];
        const dataIds: string[] = [];

        docSnap.forEach((doc) => {
          databaseInfo.push({
            ...doc.data(),
            id: doc.id,
          });
          dataIds.push(doc.id);
        });

        setUser(databaseInfo);
      });
      setLoading(false);
    }
    fetchData();
  }, []);

  return {
    data: user,
    fetchData: refetch,
    loading,
  };
}

export function useGetFeaturedProject(): any {
  const [user, setUser] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const refetch = useCallback(() => {
    async function fetchData() {
      setLoading(true);
      const docRef = query(
        collection(db, 'maps'),
        where('featured', '==', true),
        limit(1)
      );

      try {
        const querySnapshot = await getDocs(docRef);
        if (!querySnapshot.empty) {
          const latestBlogData = {
            ...querySnapshot.docs[0].data(),
            id: querySnapshot.docs[0].id,
          };
          setUser(latestBlogData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching latest Map:', error);
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  return {
    data: user,
    fetchData: refetch,
    loading,
  };
}

export function useGetFeatured2Project(): any {
  const [user, setUser] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const refetch = useCallback(() => {
    async function fetchData() {
      setLoading(true);
      const docRef = query(
        collection(db, 'maps'),
        where('featured2', '==', true),
        limit(1)
      );

      try {
        const querySnapshot = await getDocs(docRef);
        if (!querySnapshot.empty) {
          const latestBlogData = {
            ...querySnapshot.docs[0].data(),
            id: querySnapshot.docs[0].id,
          };
          setUser(latestBlogData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching latest Map:', error);
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  return {
    data: user,
    fetchData: refetch,
    loading,
  };
}