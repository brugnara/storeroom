import React from 'react';

import { Switch, Route } from 'react-router';
import {Me} from '../pages/Me';
import {Signup} from '../pages/Signup';

export default class Body extends React.Component {
    public render(): React.ReactNode {
        return (
            <Switch>
                <Route path="/items">
                    Items
                </Route>
                <Route path="/me">
                    <Me/>
                </Route>
                <Route path="/signup">
                    <Signup/>
                </Route>
                <Route path="/">
                    Default
                </Route>
            </Switch>
        );
    }
}
