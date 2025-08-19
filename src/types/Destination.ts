import { Timestamp } from 'firebase/firestore';

export type DestinationType = {
  id: string;
  title: string;
  description?: string;
  metaInfo?: string[];
  dateCreated?: Timestamp;
  images?: string[];
  url?: string;
  media?: {
    audioUrl?: string;
    ebookUrl?: string;
  };
  thumb?: string;
  hideFromList?: boolean;
};