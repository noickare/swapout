import { getDoc, setDoc, doc } from "firebase/firestore";
import { IItem } from "../../models/item";
import { firestore } from "../init_firebase";

export const createItem = async (item: IItem) => {
    try {
        await setDoc(doc(firestore, "items", item.uid), item);
        return item;
    } catch (e: any) {
        throw new Error(e.message);

    }
}

export const getItem = async (uid: string) => {
    try {
        const docRef = doc(firestore, "items", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as IItem;
        } else {
            throw new Error("Item not found");
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
}
