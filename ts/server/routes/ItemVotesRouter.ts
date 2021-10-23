import { FindOptions } from 'mongodb';
import { ItemVoteFromDB } from '../../common/Types';
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
}
