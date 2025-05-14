import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore"; 
import { useCallback, useState } from "react"; 
import { db } from "../../firebase/config"; 

export const useFetchComments = () => { 
  const [comments, setComments] = useState<any>([]); 
  const [loadingAllComments, setLoadingAllComments] = useState(false); 
  const refetch = useCallback((communityId: string, colls = "requests") => { 
    const fetchData = async () => { 
      try { 
        setLoadingAllComments(true); 

        const commentsRef = collection(db, colls, communityId, "comments"); 
        const commentsSnapshot = await getDocs(query(commentsRef, orderBy("timestamp", "asc"))); 

        const commentPromises = commentsSnapshot.docs.map(async (dc) => { 
          const commentData = dc.data(); 
          const studentRef = doc(db, "students", commentData.author); 
          const studentSnapshot = await getDoc(studentRef); 
          const authData = studentSnapshot.exists() ? studentSnapshot.data() : null; 

          return { 
            ...commentData, 
            authorData: authData, 
            id: dc.id, 
          }; 
        }); 

        const allComments = await Promise.all(commentPromises); 
        setComments(allComments); 
      } catch (error) { 
        console.error(error); 
      } finally { 
        setLoadingAllComments(false); 
      } 
    }; 
    fetchData(); 
  }, []); 

  return { comments, loadingAllComments, refetch } as any; 
};
