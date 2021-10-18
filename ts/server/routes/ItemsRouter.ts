import { BaseRouter } from './BaseRouter';

import { Collection, Document } from 'mongodb';

import { Item, ItemFromDB } from '../../common/Types';
import FalcorRouter from 'falcor-router';
import FalcorJsonGraph, { Range } from 'falcor-json-graph';
import { Prefixer } from '../helpers/Prefixer';

export class ItemsRouter extends BaseRouter<ItemFromDB> {
    byID(): FalcorRouter.RouteDefinition {
        const that = this;
        return {
            route: Prefixer.byID(this.prefix),
            async get(pathSet: FalcorJsonGraph.PathSet) {
                const ids = pathSet.pop() as Array<string>,
                    values = await that.collection
                        .find(
                            {
                                _id: { $in: ids },
                            },
                            {
                                _id: 1,
                                productor: 1,
                                name: 1,
                                createdBy: 1,
                                cb: 1,
                                submitted: 1,
                            } as Document
                        )
                        .toArray(),
                    ret = [];

                values.forEach((value) => {
                    ret.push(
                        {
                            value,
                            path: [...pathSet, value._id],
                        },
                        {
                            value: that.routes.itemVotes.$ref(value._id),
                            path: [...pathSet, value._id, 'votes'],
                        },
                        {
                            value: that.routes.users.$ref(value.createdBy),
                            path: [...pathSet, value._id, 'createdBy'],
                        }
                    );
                });

                return ret;
            },
        };
    }

    find(): FalcorRouter.RouteDefinition {
        const that = this;

        return {
            route: Prefixer.join(this.prefix, 'find[{keys:terms}][{ranges}]'),
            async get(pathSet: FalcorJsonGraph.PathSet) {
                const range = pathSet.pop() as Array<Range>,
                    ret = [];

                let terms = pathSet.pop() as Array<string>;

                if (range.length !== 1) {
                    throw new Error('Only one range is supported');
                }

                terms = terms
                    .map((term) => `${term}`.trim())
                    .filter((term) => term.length > 0);

                if (terms.length === 0) {
                    throw new Error('Empty query :/');
                }

                const values = await that.collection
                    .find(
                        {
                            $or: terms.map((term) => ({
                                $or: [
                                    {
                                        name: {
                                            $regex: term,
                                            $options: 'i',
                                        },
                                    },
                                    {
                                        productor: {
                                            $regex: term,
                                            $options: 'i',
                                        },
                                    },
                                    {
                                        cb: {
                                            $regex: term,
                                            $options: 'i',
                                        },
                                    },
                                ],
                            })),
                        },
                        { _id: 1 } as Document
                    )
                    .skip(range[0].from)
                    .limit(Math.min(range[0].to + 1, 100))
                    .toArray();

                for (let i = range[0].from; i <= range[0].to; i++) {
                    let value = null;

                    if (values[i - range[0].from] != null) {
                        value = that.$ref(values[i - range[0].from]._id);
                        // value = FalcorJsonGraph.ref([ 'items', 'byID', values[i]._id]);
                    }

                    ret.push({
                        value,
                        path: [...pathSet, terms[0], i],
                    });
                }

                return ret;
            },
        };
    }

    list(): FalcorRouter.RouteDefinition {
        const that = this;

        return {
            route: Prefixer.list(this.prefix),
            async get(pathSet: FalcorJsonGraph.PathSet) {
                const range = pathSet.pop() as Range,
                    values = await that.collection
                        .find({}, { _id: 1 } as Document)
                        .sort({})
                        .skip(range[0].from)
                        .limit(range[0].to)
                        .toArray();

                const ret = [];

                values.forEach((value, index) => {
                    ret.push({
                        path: [...pathSet, index + range[0].from],
                        value: that.$ref(value._id),
                    });
                });

                return ret;
            },
        };
    }
}
