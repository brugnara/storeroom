import React from 'react';
import { IdentificableDoc, KeyValueResults, ListGetter, Stock } from '../../common/Types';
import { BUSLayer } from '../helpers/BUSLayer';

export type RoomProps = IdentificableDoc;

export interface RoomState {
    stocks: KeyValueResults<Stock>;
}
export class RoomPage extends BUSLayer<RoomProps, RoomState> {
    state: RoomState = {
        stocks: {},
    };

    async componentDidMount() {
        const path = ['stocks', 'find', this.props._id, { from: 0, to: 9 }];

        const data = await this.model.get<ListGetter<Stock>>(
            [...path, ['qnt', 'expire', 'added']],
            [...path, 'userId', ['_id', 'name']],
            [...path, 'itemId', ['_id', 'name', 'productor']]
        );

        console.log(data);
        this.setState({
            stocks: data.json.stocks.list,
        });
    }

    render() {
        return (
            <div>
                <h1>Room</h1>
                <p>{this.props._id}</p>
                <pre>{JSON.stringify(this.state.stocks, null, 2)}</pre>
            </div>
        );
    }
}
