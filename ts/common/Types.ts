export interface Item {
    _id: string;
    name: string;
    cb: string;
    productor: string;
    um: string;
    qnt: number;
    createdBy: User;
    submitted: number;
}

export interface ItemsListedResults {
    [index: string]: Item;
}

export interface ItemsFindResult {
    [searchTerm: string]: ItemsListedResults;
}

export interface ItemsFindGetter {
    itemsFind: ItemsFindResult;
}

export interface User {
    _id: string;
    name: string;
}
