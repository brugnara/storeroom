import { BaseRouter } from './BaseRouter';

import { Filter } from 'mongodb';

import { ItemFromDB } from '../../common/Types';
import FalcorJsonGraph from 'falcor-json-graph';
import { Projecter } from '../helpers/Projecter';

export class ItemsRouter extends BaseRouter<ItemFromDB> {
    protected allowedFields = new Projecter<ItemFromDB>(
        {
            _id: 1,
            productor: 1,
            name: 1,
            createdBy: 1,
            cb: 1,
            submitted: 1,
            votes: 1,
        },
        {
            createdBy: (doc: ItemFromDB) => this.routes.users.$ref(doc.createdBy),
            votes: (doc: ItemFromDB) => this.routes.itemVotes.$ref(doc._id),
        }
    );

    protected async searchItems(
        _userId: string,
        term: string,
        range: FalcorJsonGraph.Range
    ): Promise<[Array<ItemFromDB>, number]> {
        const query: Filter<ItemFromDB> = {
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
            },
            options = {
                projection: {
                    _id: 1,
                },
                skip: range.from,
                limit: range.to - range.from + 1,
            };

        this.log(`Searching for items with query: ${JSON.stringify(query)}`, options);

        return await Promise.all([
            this.collection.find(query, options).toArray(),
            this.collection.countDocuments(query),
        ]);
    }
}
