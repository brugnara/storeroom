export interface Item extends IdentificableDoc {
    name: string;
    cb: string;
    productor: string;
    um: string;
    qnt: number;
    createdBy: User;
    submitted: number;
    votes?: Pick<ItemVoteFromDB, 'voteCount'>;
}

export type ItemFromDB = Omit<Item, 'createdBy'> & {
    createdBy: string;
};

export interface User extends IdentificableDoc {
    name: string;
    profile?: {
        name?: string;
        terms?: boolean;
    };
}

export interface IdentificableDoc {
    _id: string;
}

export type KeyValueResults<T> = Record<string, T>;

export type FindGetter<T> = Record<CompatibleRouters, { find: KeyValueResults<KeyValueResults<T>> }>;

export type ListGetter<T> = Record<CompatibleRouters, { list: KeyValueResults<T> }>;

export type CompatibleRouters = 'users' | 'items' | 'rooms' | 'itemVotes' | 'stocks';

export interface Stringable {
    toString(): string;
}

export interface Room extends IdentificableDoc {
    name: string;
    ownedBy: User;
    submitted: number;
    starred?: boolean;
}

export interface RoomFromDB extends Omit<Room, 'ownedBy'> {
    ownedBy: string;
}

export interface ItemVote extends IdentificableDoc {
    itemId: Item;
    owner: User;
    date: number;
}

export interface ItemVoteFromDB extends Omit<ItemVote, 'itemId' | 'owner'> {
    itemId: string;
    owner: string;
    voteCount?: number;
}

export interface Stock extends IdentificableDoc {
    qnt: number;
    expire: number;
    added: number;
    roomId: Room;
    userId: User;
    itemId: Item;
}

export interface StockFromDB extends Omit<Stock, 'roomId' | 'userId' | 'itemId'> {
    roomId: string;
    userId: string;
    itemId: string;
}
