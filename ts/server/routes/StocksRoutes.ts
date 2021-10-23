import FalcorRouter from 'falcor-router';
import { StockFromDB } from '../../common/Types';
import { Prefixer } from '../helpers/Prefixer';
import { BaseRouter } from './BaseRouter';
import { Projecter } from '../helpers/Projecter';

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
