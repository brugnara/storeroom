import FalcorRouter from 'falcor-router';
import { StockFromDB } from '../../common/Types';
import { Prefixer } from '../helpers/Prefixer';
import { BaseRouter } from './BaseRouter';
import FalcorJsonGraph from 'falcor-json-graph';
import { Projecter } from '../helpers/Projecter';
import { identificablesToObject } from '../../common/Helpers';

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
            roomId: (value: StockFromDB) => {
                return this.routes.rooms.$ref(value.roomId);
            },
            itemId: (value: StockFromDB) => {
                return this.routes.items.$ref(value.itemId);
            },
            userId: (value: StockFromDB) => {
                return this.routes.users.$ref(value.userId);
            },
        }
    );

    byID(): FalcorRouter.RouteDefinition {
        const that = this;

        return {
            route: Prefixer.byID(this.prefix, this.allowedFields),
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
                                    userId: this.userId,
                                },
                                that.allowedFields.pick(askedFields)
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
                            that.allowedFields.resolve(
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

    inRoom(): FalcorRouter.RouteDefinition {
        return this.authenticated.keyedAndRangedResults(
            Prefixer.join(
                this.prefix,
                'inRoom[{keys}][{ranges}]',
                this.allowedFields
            ),
            (roomId: string, userId: string) => ({
                roomId,
                userId,
            })
        );
    }
}
