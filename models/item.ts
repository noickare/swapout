import { FieldValue } from "firebase/firestore";
import { ILocation } from "./location";

export interface IItem {
    uid: string;
    name: string;
    location: ILocation;
    category?: string[];
    description: string;
    condition: itemCondition;
    yearManufactured: number;
    yearBought: number;
    images?: string[];
    itemToExchangeWith: string;
    ownerId: string;
    createdAt: FieldValue
    updatedAt?: FieldValue
}

export enum itemCondition {
    Used,
    New,
    Refurbished
}