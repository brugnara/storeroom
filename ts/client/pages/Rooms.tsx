import React from 'react';
import { ListGetter, Room } from '../../common/Types';
import { keyValuedResultsToArray } from '../../common/Helpers';
import model from '../Model';

export interface RoomsState {
    rooms: Array<Room>;
}

export class Rooms extends React.Component<{}, RoomsState> {
    state: RoomsState = { rooms: [] };

    async componentDidMount() {
        const roomsFetched = await model.get<ListGetter<Room>>([
            'rooms',
            'list',
            { to: 10 },
            ['_id', 'name', 'submitted', 'ownedBy'],
            ['_id', 'name'],
        ]);
        console.log('roomsFetched', roomsFetched);

        console.log(roomsFetched.json.rooms.list);
        console.log(keyValuedResultsToArray(roomsFetched.json.rooms.list));
    }

    render(): React.ReactNode {
        return 'room';
    }
}
