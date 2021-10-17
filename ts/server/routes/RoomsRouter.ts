import FalcorRouter from 'falcor-router';
import { RoomFromDB } from '../../common/Types';
import { Prefixer } from '../helpers/Prefixer';
import { BaseRouter } from './BaseRouter';
import { Document } from 'mongodb';
import FalcorJsonGraph from 'falcor-json-graph';

export class RoomsRouter extends BaseRouter<RoomFromDB> {
    byID(): FalcorRouter.RouteDefinition {
        const that = this;

        return {
            route: Prefixer.byID(this.prefix),
            async get(pathSet) {
                const ids = pathSet.pop(),
                    ret = [];

                that.collection
                    .find<RoomFromDB>({ _id: { $in: ids } } as Document)
                    .forEach((room) => {
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

                return ret;
            },
        };
    }

    list(): FalcorRouter.RouteDefinition {
        const that = this;

        return {
            route: Prefixer.list(this.prefix),
            async get(pathSet) {
                const range = pathSet.pop() as Array<FalcorJsonGraph.Range>,
                    ret = [];

                const values = await that.collection
                    .find<RoomFromDB>({})
                    .skip(range[0].from)
                    .limit(range[0].to)
                    .toArray();

                values.forEach((room, index) => {
                    const initialPath = [...pathSet, index + range[0].from];

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
                            path: [...initialPath, 'ownedBy'],
                            value: that.routes.users.$ref(room.ownedBy),
                        }
                    );
                });

                return ret;
            },
        };
    }
}