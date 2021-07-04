export interface IUser {
    loggedIn?: boolean;
    name: string;
}

export interface IUserAction {
    type: 'login';
    data: IUser;
}

function init(): IUser {
    return {
        loggedIn: false,
        name: null,
    };
}

function reducer(store = init(), action: IUserAction): IUser {
    switch (action.type) {
    case 'login':
        return {
            ...store,
            ...action.data,
            loggedIn: true,
        };
    default:
        return store;
    }
}

export default reducer;
