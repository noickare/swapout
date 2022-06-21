import { getDoc, setDoc, doc, getDocs, collection, query, orderBy, limit, QueryDocumentSnapshot, DocumentData, startAfter, where } from "firebase/firestore";
import { IConversation } from "../../models/conversation";
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

export interface getItemsParams {
   lastDoc?: QueryDocumentSnapshot<DocumentData>,
   itemsLimit?: number
}

export const getItems = async (params?: getItemsParams) => {
    try {
        const q = query(collection(firestore, "items"), orderBy("createdAt"), startAfter(params?.lastDoc || 0), limit(params?.itemsLimit || 15));
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

export const getUserItems = async (userId: string, lastDoc?: QueryDocumentSnapshot<DocumentData>) => {
    try {
        if (userId) {
            const itemsRef = collection(firestore, "items");
            const q = query(itemsRef, where("ownerId", "==", userId), orderBy("createdAt"), startAfter(lastDoc || 0), limit(15));
            const querySnapshot = await getDocs(q);
            const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
            const itemsArray: IItem[] = [];
            querySnapshot.forEach((doc) => {
                itemsArray.push(doc.data() as IItem)
            })
            return { lastVisible, itemsArray }
        } else {
            return {lastVisible: undefined, itemsArray: undefined};
        }
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export const getItemConversations = async (itemId: string) => {
    try {
        if (itemId) {
            const q = query(collection(firestore, "conversations"), orderBy("updatedAt", "desc"), where("itemId", "==", itemId))
            const querySnapshot = await getDocs(q);
            const itemsArray: IConversation[] = [];
            querySnapshot.forEach((doc) => {
                itemsArray.push(doc.data() as IConversation)
            })
            return itemsArray
        } else {
            return undefined
        }
    } catch (error: any) {
        throw new Error(error.message)
    }
}