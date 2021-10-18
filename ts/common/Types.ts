export interface Item extends IdentificableDoc {
    name: string;
    cb: string;
    productor: string;
    um: string;
    qnt: number;
    createdBy: User;
    submitted: number;
    votes: number;
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

export type KeyValueResults<T> = Record<string, T>;

export type FindGetter<T> = Record<
    CompatibleRouters,
    { find: KeyValueResults<KeyValueResults<T>> }
>;

export type ListGetter<T> = Record<
    CompatibleRouters,
    { list: KeyValueResults<T> }
>;

export type CompatibleRouters =
    | 'users'
    | 'items'
    | 'rooms'
    | 'itemVotes'
    | 'stocks';

export interface Stringable {
    toString(): string;
}

export interface Room extends IdentificableDoc {
    name: string;
    ownedBy: User;
    submitted: number;
    starred?: boolean;
}

export type RoomFromDB = Room & {
    ownedBy: string;
};

export interface ItemVote extends IdentificableDoc {
    itemId: Item;
    owner: User;
    date: number;
}

export type ItemVoteFromDB = ItemVote & {
    itemId: string;
    owner: string;
};

export interface Stock extends IdentificableDoc {
    qnt: number;
    expire: number;
    added: number;
    roomId: Room;
    userId: User;
    itemId: Item;
}

export type StockFromDB = Stock & {
    roomId: string;
    userId: string;
    itemId: string;
};
