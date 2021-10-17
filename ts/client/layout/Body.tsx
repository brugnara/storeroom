import React from 'react';

import { Switch, Route } from 'react-router';
import { Items } from '../pages/Items';
import { Me } from '../pages/Me';
import { Rooms } from '../pages/Rooms';
import { Signup } from '../pages/Signup';

export default class Body extends React.Component {
    public render(): React.ReactNode {
        return (
            <Switch>
                <Route path="/items">
                    <Items />
                </Route>
                <Route path="/rooms">
                    <Rooms />
                </Route>
                <Route path="/me">
                    <Me />
                </Route>
                <Route path="/signup">
                    <Signup />
                </Route>
                <Route path="/">Default</Route>
            </Switch>
        );
    }
}
