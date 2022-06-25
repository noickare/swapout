import localforage from "localforage";

export const getItemFromLocalForage = async (key: string) => {
    const item =  await localforage.getItem(key, function (err, value) {
        if (err) {
            throw new Error(err);
        } else {
            return value;
        }
    });

    return item
}