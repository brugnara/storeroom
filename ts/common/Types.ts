export interface Item {
    _id: string;
    name: string;
    cb: string;
    productor: string;
    createdBy: User;
}

export interface ItemsFindResult {
    [searchTerm: string]: {
        [index: string]: Item;
    };
}

export interface ItemsFindGetter {
    itemsFind: ItemsFindResult;
}

export interface User {
    _id: string;
    profile: {
        name: string;
    };
}
