import { combineReducers, createStore } from '@reduxjs/toolkit';
import user from './reducers/UserReducer';
import search from './reducers/SearchReducer';

const store = createStore(combineReducers({ user, search }));

export type IState = ReturnType<typeof store.getState>;

export default store;
