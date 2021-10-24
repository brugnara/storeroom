import { StockFromDB } from '../../common/Types';
import { BaseRouter } from './BaseRouter';
import { Projecter } from '../helpers/Projecter';
import { Filter, FindOptions } from 'mongodb';
import FalcorJsonGraph from 'falcor-json-graph';

export class StockRoutes extends BaseRouter<StockFromDB> {
    protected allowedFields = new Projecter<StockFromDB>(
        {
            _id: true,
            qnt: true,
            expire: true,
            added: true,
            userId: true,
            roomId: true,
            itemId: true,
        },
        {
            roomId: (doc: StockFromDB) => this.routes.rooms.$ref(doc.roomId),
            itemId: (doc: StockFromDB) => this.routes.items.$ref(doc.itemId),
            userId: (doc: StockFromDB) => this.routes.users.$ref(doc.userId),
        }
    );

    protected async findValues(
        userId: string,
        options?: FindOptions<StockFromDB>
    ): Promise<Array<StockFromDB>> {
        this.log('findValues', userId, options);

        return await this.collection
            .find(
                {
                    ownedBy: userId,
                },
                options
            )
            .toArray();
    }

    protected async searchItems(
        _userId: string,
        roomId: string,
        range: FalcorJsonGraph.Range
    ): Promise<[Array<StockFromDB>, number]> {
        const query: Filter<StockFromDB> = { roomId };

        this.log('searchItems', query);

        return await Promise.all([
            this.collection
                .find(query, {
                    projection: {
                        _id: 1,
                    },
                    skip: range.from,
                    limit: range.to - range.from + 1,
                })
                .toArray(),
            this.collection.countDocuments(query),
        ]);
    }
}
