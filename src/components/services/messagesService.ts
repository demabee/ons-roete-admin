import {
  onSnapshot,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import moment from "moment";
import { db } from "../../firebase/config";

export const subscribeToMessages = (
  type: any,
  callback: (arg0: { createdAt: moment.Moment }[]) => void,
  setLoading: (arg0: boolean) => void,
  messQuery?: any
) => {
  // Set loading state to true
  setLoading(true);

  // Define the messages query based on the type
  const messagesQuery = query(
    collection(db, "messages"),
    where("type", "==", type ?? "general")
  );

  const unsubscribe = onSnapshot(
    messQuery || messagesQuery,
    (snapshot: { docs: any[] }) => {
      const messages = snapshot.docs.map((doc) => ({
        ...doc.data(),
        createdAt: doc.data().createdAt
          ? moment(doc.data().createdAt.toDate())
          : moment(),
      }));

      // You can apply your custom logic here
      // if (value && value !== 'All') {
      //   messages = messages.filter((m) => m.seen === undefined);
      // }

      // Call the callback function with the modified messages
      callback(messages);

      // Set loading state to false
      setLoading(false);
    },
    (error) => {
      console.error(error);
      // Set loading state to false in case of an error
      setLoading(false);
    }
  );

  return unsubscribe;
};

export const subscribeToMessageCount = async(
  type: any,
  callback: (arg0: number) => void,
  setLoading: (arg0: boolean) => void
) => {
  // Set loading state to true
  setLoading(true);

  // Define the messages query based on the type
  const messagesQuery = query(
    collection(db, "messages"),
    where("receiver", "in", ["admin"]),
    where("type", "==", type ?? "general")
  );

  const unsubscribe = await getDocs(messagesQuery)
    .then((snapshot) => {
        console.log('test');
      // Get the total count of messages
      const totalCount = snapshot.docs.filter((s) => !s.data().seen).length;

      // Call the callback function with the total count
      callback(totalCount);

      // Set loading state to false
      setLoading(false);
    })
    .catch((error) => {
      console.error(error);
      // Set loading state to false in case of an error
      setLoading(false);
    });

  return unsubscribe;
};
