interface Item {
    _id: string;
    name: string;
    cb: string;
    productor: string;
}

export type ItemGetter = {
    item: Item;
};
