import { collection, doc, getDocs, query } from "firebase/firestore";
import { useCallback, useState } from "react";
import { db } from "../../firebase/config";

export default function useGetRequests(): any {
  const [user, setUser] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const refetch = useCallback(() => {
    async function fetchData() {
      setLoading(true);
      const docRef = collection(db, "categories");

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

export function useGetSubCategories(): any {
  const [user, setUser] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const refetch = useCallback((id: any) => {
    async function fetchData() {
      const categoryDocRef = doc(db, "categories", id);
      const subcategoriesCollectionRef = collection(
        categoryDocRef,
        "subcategories"
      );
      const q = query(subcategoriesCollectionRef);

      const querySnapshot = await getDocs(q);
      const subcategoriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUser(subcategoriesData);
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


export function useGetAllSubCategories(): any {
  const [user, setUser] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const refetch = useCallback((id: any) => {
    async function fetchData() {
      setLoading(true);
      const docRef = collection(db, "subcategories");

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
