export interface Item extends IdentificableDoc {
    name: string;
    cb: string;
    productor: string;
    um: string;
    qnt: number;
    createdBy: User;
    submitted: number;
}

export type ItemFromDB = Item & {
    createdBy: string;
};

export interface User extends IdentificableDoc {
    name: string;
}

export interface IdentificableDoc {
    _id: string;
}
export interface ItemsListedResults {
    [index: string]: Item;
}

export interface ItemsFindResult {
    [searchTerm: string]: ItemsListedResults;
}

export interface ItemsFindGetter {
    items: { find: ItemsFindResult };
}
