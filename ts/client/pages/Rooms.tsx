import React from 'react';
import { ListGetter, Room } from '../../common/Types';
import { keyValuedResultsToArray } from '../../common/Helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { Link } from 'react-router-dom';
import { BUSLayer } from '../helpers/BUSLayer';

export interface RoomsState {
    rooms: Array<Room>;
}

export class RoomsPage extends BUSLayer<{}, RoomsState> {
    state: RoomsState = { rooms: [] };

    async componentDidMount() {
        const roomsFetched = await this.model.get<ListGetter<Room>>([
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
                        <Link key={room._id} to={`/rooms/${room._id}`}>
                            {room.name}
                            <FontAwesomeIcon
                                icon={room.starred ? faStar : farStar}
                            />
                        </Link>
                    );
                })}
            </div>
        );
    }
}
