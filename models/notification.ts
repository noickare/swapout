import { FieldValue } from "firebase/firestore";

export interface INotification {
    uid: string;
    content: string;
    seen: boolean;
    deepLink: string;
    createdAt: FieldValue
}