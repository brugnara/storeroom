export interface ISearch {
    query: string;
}

export interface ISearchAction {
    type: 'SEARCH_FOR';
    data: ISearch;
}

function init(): ISearch {
    return {
        query: '',
    };
}

function reducer(store = init(), action: ISearchAction): ISearch {
    const newStore = JSON.parse(JSON.stringify(store));

    switch (action.type) {
        case 'SEARCH_FOR':
            return {
                ...newStore,
                ...action.data,
            };
        default:
            return store;
    }
}

export default reducer;
