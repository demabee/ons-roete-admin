import { FieldValue, Timestamp } from 'firebase/firestore';

export type TestimonialType = {
  id: string;
  name: string;
  description: string;
  dateCreated?: Timestamp | FieldValue;
}