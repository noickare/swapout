import { FieldValue } from "firebase/firestore";
import { ILocation } from "./location";

export interface IUser {
    uid: string;
    email: string;
    name: string;
    username: string;
    avatar?: string;
    bio?: string;
    createdAt: string;
    updatedAt?: FieldValue;
    lastLoginTime: string;
    isEmailVerified: boolean;
    location?: ILocation;
    fcmToken?: string;
}