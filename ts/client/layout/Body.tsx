import React from 'react';

import { Switch, Route, useParams } from 'react-router';
import { IdentificableDoc } from '../../common/Types';
import { ItemsPage } from '../pages/ItemsPage';
import { MePage } from '../pages/MePage';
import { RoomPage } from '../pages/RoomPage';
import { RoomsPage } from '../pages/RoomsPage';
import { SignupPage } from '../pages/SignupPage';

function MountedRoom() {
    const params = useParams<IdentificableDoc>();

    return <RoomPage {...params} />;
}
export default class Body extends React.Component {
    public render(): React.ReactNode {
        return (
            <Switch>
                <Route path="/items">
                    <ItemsPage />
                </Route>
                <Route exact path="/rooms">
                    <RoomsPage />
                </Route>
                <Route exact path="/rooms/:_id">
                    <MountedRoom />
                </Route>
                <Route path="/me">
                    <MePage />
                </Route>
                <Route path="/signup">
                    <SignupPage />
                </Route>
            </Switch>
        );
    }
}
