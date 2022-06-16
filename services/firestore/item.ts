import { getDoc, setDoc, doc, getDocs, collection, query, orderBy, limit, QueryDocumentSnapshot, DocumentData, startAfter } from "firebase/firestore";
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

export const getItems = async (lastDoc?: QueryDocumentSnapshot<DocumentData>) => {
    try {
        console.log('lastDoc', lastDoc?.data().name)
        const q = query(collection(firestore, "items"), orderBy("createdAt"), startAfter(lastDoc || 0), limit(15));
        const documentSnapshots = await getDocs(q)
        const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
        const itemsArray: IItem[] = []; 
        documentSnapshots.forEach((doc) => {
            itemsArray.push(doc.data() as IItem)
        })

        return { lastVisible, itemsArray }


    } catch (error: any) {
        throw new Error(error.message)
    }

}
