import { collection, addDoc, getDoc, doc, setDoc, query, where, orderBy, startAfter, getDocs } from "firebase/firestore";
import { IConversation } from "../../models/conversation";
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


export const updateUser = async (user: IUser) => {
    try {
        await setDoc(doc(firestore, "users", user.uid), user);
        const updatedUser = await getUser(user.uid);
        return updatedUser;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

