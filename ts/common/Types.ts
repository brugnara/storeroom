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

export type KeyValueResults<T> = Record<string, T>;

export type FindGetter<T> = Record<
    CompatibleRouters,
    { find: KeyValueResults<KeyValueResults<T>> }
>;

export type ListGetter<T> = Record<
    CompatibleRouters,
    { list: KeyValueResults<T> }
>;

export type CompatibleRouters = 'users' | 'items' | 'rooms';

export interface Room extends IdentificableDoc {
    name: string;
    ownedBy: User;
    submitted: number;
    starred?: boolean;
}

export type RoomFromDB = Room & {
    ownedBy: string;
};
