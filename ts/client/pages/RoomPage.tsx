import React from 'react';
import { keyValuedResultsToArray } from '../../common/Helpers';
import { CountableResult, FindGetter, IdentificableDoc, Stock } from '../../common/Types';
import { BUSLayer } from '../helpers/BUSLayer';

export type RoomProps = IdentificableDoc;

export interface RoomState extends CountableResult {
    stocks: Array<Stock>;
}
export class RoomPage extends BUSLayer<RoomProps, RoomState> {
    state: RoomState = {
        stocks: [],
        count: 0,
    };

    async componentDidMount() {
        const path = ['stocks', 'find', this.props._id, { from: 0, to: 9 }];

        const data = await this.model.get<FindGetter<Stock>>(
            ['stocks', 'find', this.props._id, 'count'],
            [...path, ['qnt', 'expire', 'added']],
            [...path, 'userId', ['_id', 'name']],
            [...path, 'itemId', ['_id', 'name', 'productor']]
        );

        console.log(data);
        this.setState({
            stocks: keyValuedResultsToArray(data.json.stocks.find[this.props._id]),
            count: data.json.stocks.find[this.props._id].count ?? 0,
        });
    }

    render() {
        return (
            <div>
                <h1>Room</h1>
                <p>
                    {this.props._id} ha {this.state.count} oggetti
                </p>
                <pre>{JSON.stringify(this.state.stocks, null, 2)}</pre>
            </div>
        );
    }
}
