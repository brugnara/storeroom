import { RoomFromDB } from '../../common/Types';
import { BaseRouter } from './BaseRouter';
import { Projecter } from '../helpers/Projecter';
import { FindOptions } from 'mongodb';

export class RoomsRouter extends BaseRouter<RoomFromDB> {
    protected allowedFields: Projecter<RoomFromDB> = new Projecter<RoomFromDB>(
        {
            _id: 1,
            name: 1,
            submitted: 1,
            starred: 1,
            ownedBy: 1,
        },
        {
            ownedBy: (doc: RoomFromDB) => this.routes.users.$ref(doc.ownedBy),
        }
    );

    protected async queryAll(
        userId: string,
        options?: FindOptions<RoomFromDB>
    ): Promise<Array<RoomFromDB>> {
        this.log('getListedValues', userId, options);

        return await this.collection
            .find(
                {
                    ownedBy: userId,
                },
                options
            )
            .toArray();
    }

    protected async countAll(userId: string): Promise<number> {
        this.log('countAll', userId);

        return await this.collection.countDocuments({ ownedBy: userId });
    }
}
