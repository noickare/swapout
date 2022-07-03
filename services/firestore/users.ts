import { collection, addDoc, getDoc, doc, setDoc, query, where, orderBy, startAfter, getDocs, QueryDocumentSnapshot, DocumentData, limit } from "firebase/firestore";
import { IConversation } from "../../models/conversation";
import { INotification } from "../../models/notification";
import { IUser } from "../../models/user";
import { firestore } from "../init_firebase";

export const createUser = async (user: IUser) => {
    try {
        await addDoc(collection(firestore, "users"), user);
        await setDoc(doc(firestore, "users", user.uid), user);
        return user;
    } catch (e: any) {
        throw new Error(e.message);

    }
}

export const getUser = async (uid: string) => {
    try {
        const docRef = doc(firestore, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as IUser;
        } else {
            throw new Error("User not found");
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
}


export interface getNotificationsParams {
    userId: string
    lastDoc?: QueryDocumentSnapshot<DocumentData>,
    itemsLimit?: number
}

export const getNotifications = async (params?: getNotificationsParams) => {
    try {
        const q = query(collection(firestore, "users", params?.userId as string, "notifications"), orderBy("createdAt"), startAfter(params?.lastDoc || 0), limit(params?.itemsLimit || 15),);
        const documentSnapshots = await getDocs(q)
        const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
        const notificationsArray: INotification[] = [];
        documentSnapshots.forEach((doc) => {
            notificationsArray.push(doc.data() as INotification);
        })

        console.log('notifications', notificationsArray);

        return { lastVisible, notificationsArray }


    } catch (error: any) {
        throw new Error(error.message)
    }

}


export const updateUser = async (user: IUser) => {
    try {
        await setDoc(doc(firestore, "users", user.uid), user);
        const updatedUser = await getUser(user.uid);
        return updatedUser;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

