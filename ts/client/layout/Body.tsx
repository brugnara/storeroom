import React from 'react';

import { Switch, Route, useParams } from 'react-router';
import { IdentificableDoc } from '../../common/Types';
import { ItemsPage } from '../pages/Items';
import { Me } from '../pages/Me';
import { RoomPage } from '../pages/Room';
import { RoomsPage } from '../pages/Rooms';
import { Signup } from '../pages/Signup';

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
                    <Me />
                </Route>
                <Route path="/signup">
                    <Signup />
                </Route>
            </Switch>
        );
    }
}
