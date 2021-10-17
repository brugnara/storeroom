import React from 'react';
import { ListGetter, Room } from '../../common/Types';
import { keyValuedResultsToArray } from '../../common/Helpers';
import model from '../Model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';

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
            ]),
            rooms = keyValuedResultsToArray(roomsFetched.json.rooms.list);

        console.log(rooms);

        this.setState({ rooms });
    }

    render(): React.ReactNode {
        return (
            <div className="rooms">
                {this.state.rooms.map((room) => {
                    return (
                        <div key={room._id}>
                            {room.name}
                            <FontAwesomeIcon
                                icon={room.starred ? faStar : farStar}
                            />
                        </div>
                    );
                })}
            </div>
        );
    }
}
