import FalcorJsonGraph from 'falcor-json-graph';
import FalcorRouter from 'falcor-router';
import { ItemVoteFromDB } from '../../common/Types';
import { Prefixer } from '../helpers/Prefixer';
import { BaseRouter } from './BaseRouter';

export class ItemVotesRouter extends BaseRouter<ItemVoteFromDB> {
    byID(): FalcorRouter.RouteDefinition {
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
                    const value =
                        values.find((value) => value._id === id)?.count ?? 0;

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
