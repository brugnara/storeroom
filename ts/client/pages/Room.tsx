import React from 'react';
import { IdentificableDoc, Room } from '../../common/Types';
import { BUSLayer } from '../helpers/BUSLayer';

export type RoomProps = IdentificableDoc;

export class RoomPage extends BUSLayer<RoomProps> {
    async componentDidMount() {
        const path = ['stocks', 'inRoom', this.props._id, { from: 0, to: 9 }];

        try {
            const data = await this.model.get<Room>(
                [...path, ['qnt', 'expire', 'added']],
                [...path, 'userId', ['_id', 'name']],
                [...path, 'itemId', ['_id', 'name', 'productor']]
            );

            console.log(data);
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        return (
            <div>
                <h1>Room</h1>
                <p>{this.props._id}</p>
            </div>
        );
    }
}
