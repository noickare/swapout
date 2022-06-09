import { collection, addDoc, getDoc, doc } from "firebase/firestore";
import { IUser } from "../../models/user";
import { firestore } from "../init_firebase";

export const createUser = async (user: IUser) => {
    try {
        await addDoc(collection(firestore, "users"), user);
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
