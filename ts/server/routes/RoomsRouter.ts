import FalcorRouter from 'falcor-router';
import { RoomFromDB } from '../../common/Types';
import { Prefixer } from '../helpers/Prefixer';
import { BaseRouter } from './BaseRouter';
import { Document } from 'mongodb';
import FalcorJsonGraph from 'falcor-json-graph';
import { Projecter } from '../helpers/Projecter';

export class RoomsRouter extends BaseRouter<RoomFromDB> {
    protected allowedFields: Projecter<RoomFromDB> = null;

    byID(): FalcorRouter.RouteDefinition {
        const that = this;

        return {
            route: Prefixer.byID(this.prefix),
            async get(pathSet) {
                if (!this.authenticated) {
                    throw new Error('Not logged in');
                }

                const ids = pathSet.pop(),
                    ret = [];

                console.log(ids);

                // todo: fix this horseshit
                (
                    await that.collection
                        .find<RoomFromDB>({ _id: { $in: ids } } as Document)
                        .toArray()
                ).forEach((room) => {
                    ret.push(
                        {
                            path: [...pathSet, room._id, 'name'],
                            value: room.name,
                        },
                        {
                            path: [...pathSet, room._id, 'submitted'],
                            value: room.submitted,
                        },
                        {
                            path: [...pathSet, room._id, 'ownedBy'],
                            value: that.routes.users.$ref(room.ownedBy),
                        }
                    );
                });

                console.log(ret);

                return ret;
            },
        };
    }

    list(): FalcorRouter.RouteDefinition {
        const that = this;

        return {
            route: Prefixer.list(this.prefix),
            async get(pathSet) {
                if (!this.userId) {
                    throw new Error('Not logged in');
                }

                const range = pathSet.pop() as Array<FalcorJsonGraph.Range>,
                    ret = [],
                    values = await that.collection
                        .find<RoomFromDB>({
                            ownedBy: this.userId,
                        })
                        .skip(range[0].from)
                        .limit(range[0].to + 1)
                        .toArray();

                for (let i = range[0].from; i <= range[0].to; i++) {
                    const room = values[i] || null,
                        initialPath = [...pathSet, i + range[0].from];

                    if (!room) {
                        ret.push({
                            path: [...initialPath],
                            value: null,
                        });
                        continue;
                    }

                    ret.push(
                        {
                            path: [...initialPath, '_id'],
                            value: room._id,
                        },
                        {
                            path: [...initialPath, 'name'],
                            value: room.name,
                        },
                        {
                            path: [...initialPath, 'submitted'],
                            value: room.submitted,
                        },
                        {
                            path: [...initialPath, 'starred'],
                            value: room.starred,
                        },
                        {
                            path: [...initialPath, 'ownedBy'],
                            value: that.routes.users.$ref(room.ownedBy),
                        }
                    );
                }

                return ret;
            },
        };
    }
}
