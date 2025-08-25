import { FieldValue, Timestamp } from 'firebase/firestore';

export type InterestType = {
  id: string;
  title: string;
  dateCreated?: Timestamp | FieldValue;
  imageUrl?: string;
}