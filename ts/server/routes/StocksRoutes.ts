import { StockFromDB } from '../../common/Types';
import { BaseRouter } from './BaseRouter';
import { Projecter } from '../helpers/Projecter';
import { FindOptions } from 'mongodb';

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
            roomId: (doc: StockFromDB) => this.routes.rooms.$ref(doc.roomId),
            itemId: (doc: StockFromDB) => this.routes.items.$ref(doc.itemId),
            userId: (doc: StockFromDB) => this.routes.users.$ref(doc.userId),
        }
    );

    protected async findValues(
        userId: string,
        options?: FindOptions<StockFromDB>
    ): Promise<Array<StockFromDB>> {
        this.log('findValues', userId, options);

        return await this.collection
            .find(
                {
                    ownedBy: userId,
                },
                options
            )
            .toArray();
    }
}
