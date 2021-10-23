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
    ): Promise<Array<ItemFromDB>> {
        return await this.collection
            .find(
                {
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
                } as Filter<ItemFromDB>,
                {
                    projection: {
                        _id: 1,
                    },
                    skip: range.from,
                    limit: range.to + 1,
                }
            )
            .toArray();
    }
}
