import { combineReducers, createStore } from '@reduxjs/toolkit';
import user from './reducers/user';

const store = createStore(combineReducers({user}));

export type IState = ReturnType<typeof store.getState>;

export default store;
