import FalcorJsonGraph from 'falcor-json-graph';
import FalcorRouter from 'falcor-router';
import { FindOptions } from 'mongodb';
import { ItemVoteFromDB } from '../../common/Types';
import { Prefixer } from '../helpers/Prefixer';
import { Projecter } from '../helpers/Projecter';
import { BaseRouter } from './BaseRouter';

export class ItemVotesRouter extends BaseRouter<ItemVoteFromDB> {
    protected allowedFields: Projecter<ItemVoteFromDB> = new Projecter<ItemVoteFromDB>({
        voteCount: 1,
    });

    protected async getValuesByID(
        userId: string,
        ids: Array<string>,
        options?: FindOptions<ItemVoteFromDB>
    ): Promise<Array<ItemVoteFromDB>> {
        this.log('getValuesByID', userId, ids, options);

        return await this.collection
            .aggregate<ItemVoteFromDB>([
                { $match: { itemId: { $in: ids } } },
                { $group: { _id: '$itemId', voteCount: { $sum: 1 } } },
            ])
            .toArray();
    }

    _byID(): FalcorRouter.RouteDefinition {
        const that = this;

        return {
            route: Prefixer.byID(this.prefix),
            async get(pathSet: FalcorJsonGraph.PathSet) {
                const ids = pathSet.pop() as Array<string>,
                    values = await that.collection
                        .aggregate([
                            { $match: { itemId: { $in: ids } } },
                            { $group: { _id: '$itemId', count: { $sum: 1 } } },
                        ])
                        .toArray();

                const ret = [];

                ids.forEach((id) => {
                    const value = values.find((value) => value._id === id)?.count ?? 0;

                    ret.push({
                        value,
                        path: [...pathSet, id],
                    });
                });

                console.log(ret);

                return ret;
            },
        };
    }
}
