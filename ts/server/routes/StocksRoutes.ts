import FalcorRouter from 'falcor-router';
import { StockFromDB } from '../../common/Types';
import { Prefixer } from '../helpers/Prefixer';
import { BaseRouter } from './BaseRouter';
import FalcorJsonGraph from 'falcor-json-graph';
import { Projecter } from '../helpers/Projecter';
import { identificablesToObject } from '../../common/Helpers';

export class StockRoutes extends BaseRouter<StockFromDB> {
    byID(): FalcorRouter.RouteDefinition {
        const that = this,
            allowedFields = new Projecter<StockFromDB>(
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
                    roomId(value: StockFromDB) {
                        return that.routes.rooms.$ref(value.roomId);
                    },
                    itemId(value: StockFromDB) {
                        return that.routes.items.$ref(value.itemId);
                    },
                    userId(value: StockFromDB) {
                        return that.routes.users.$ref(value.userId);
                    },
                }
            );

        return {
            route: Prefixer.byID(this.prefix, allowedFields),
            async get(pathSet: FalcorJsonGraph.PathSet) {
                if (!this.authenticated) {
                    throw new Error('Not authenticated');
                }

                const askedFields = pathSet.pop() as Array<string>,
                    ids = pathSet.pop() as Array<string>,
                    valuedIds = identificablesToObject(
                        await that.collection
                            .find(
                                {
                                    _id: { $in: ids },
                                },
                                allowedFields.pick(askedFields)
                            )
                            .toArray()
                    ),
                    ret = [];

                ids.forEach((id) => {
                    if (!valuedIds[id]) {
                        return ret.push({
                            value: null,
                            path: [...pathSet, id],
                        });
                    }

                    askedFields.forEach((field) => {
                        ret.push(
                            allowedFields.resolve(
                                [...pathSet, id],
                                field,
                                valuedIds[id]
                            )
                        );
                    });
                });

                console.log(JSON.stringify(ret));

                return ret;
            },
        };
    }
}
