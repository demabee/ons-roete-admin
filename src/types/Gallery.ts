import { Timestamp } from 'firebase/firestore';

export type GalleryType = {
  id: string;
  title: string;
  description?: string;
  dateCreated?: Timestamp;
  url?: string;
  images?: string[];
}