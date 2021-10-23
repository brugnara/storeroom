import express, { Application, NextFunction, Request, Response } from 'express';
import { MongoClient } from 'mongodb';

import fs from 'fs';
import path from 'path';
import falcorExpress from 'falcor-express';
import Router from 'falcor-router';

import { UsersRouter } from './routes/UsersRouter';
import {
    ItemFromDB,
    ItemVoteFromDB,
    RoomFromDB,
    StockFromDB,
    User,
} from '../common/Types';
import { ItemsRouter } from './routes/ItemsRouter';
import { RoomsRouter } from './routes/RoomsRouter';
import { ItemVotesRouter } from './routes/ItemVotesRouter';
import { StockRoutes } from './routes/StocksRoutes';

const app: Application = express(),
    FAKE_USER_ID: string = process.env.FAKE_USER_ID || null,
    PORT: number = +(process.env.PORT ?? 8000),
    publicUrl: string = process.env.PUBLIC_URL ?? '',
    indexHtml: string = fs
        .readFileSync(path.join(__dirname, '../../public/index.html'), 'utf8')
        .replace(/%PUBLIC_URL%/g, publicUrl),
    mongoClient = new MongoClient(
        process.env.MONGODB_URI ??
            'mongodb://storeroom:password@0.0.0.0:27017/storeroom'
    );

FAKE_USER_ID && console.log('FAKE_USER_ID is:', FAKE_USER_ID);

async function main() {
    await mongoClient.connect();

    const collectionItems = mongoClient.db().collection<ItemFromDB>('items'),
        collectionUsers = mongoClient.db().collection<User>('users'),
        collectionRooms = mongoClient.db().collection<RoomFromDB>('rooms'),
        collectionStocks = mongoClient.db().collection<StockFromDB>('stock'),
        collectionItemVotes = mongoClient
            .db()
            .collection<ItemVoteFromDB>('item_votes'),
        // routers
        usersRouter = new UsersRouter('users', collectionUsers),
        itemVotesRouter = new ItemVotesRouter(
            'itemVotes',
            collectionItemVotes,
            {
                users: usersRouter,
            }
        ),
        itemsRouter = new ItemsRouter('items', collectionItems, {
            users: usersRouter,
            itemVotes: itemVotesRouter,
        }),
        roomsRouter = new RoomsRouter('rooms', collectionRooms, {
            users: usersRouter,
        }),
        stocksRouter = new StockRoutes('stocks', collectionStocks, {
            users: usersRouter,
            items: itemsRouter,
            rooms: roomsRouter,
        }),
        //
        baseRouter = Router.createClass([
            usersRouter.byID(),
            //
            itemsRouter.byID(),
            itemsRouter.find(),
            itemsRouter.list(),
            //
            itemVotesRouter.byID(),
            //
            roomsRouter.byID(),
            roomsRouter.list(),
            //
            // stocksRouter.byID(),
            stocksRouter.inRoom(),
        ]),
        // Creating a constructor for a class that derives from BaseRouter
        mainRouter = function (userId: string) {
            // Invoking the base class constructor
            baseRouter.call(this);
            this.userId = FAKE_USER_ID || userId;
            this.authenticated = true;
            //
            console.log('UserID is:', this.userId);
        };

    // Deriving the NetflixRouter from the BaseRouter using JavaScript's classical inheritance pattern
    mainRouter.prototype = Object.create(baseRouter.prototype);

    app.use(
        '/model.json',
        falcorExpress.dataSourceRoute((_req: Request) => {
            // create a Virtual JSON resource with single key ('greeting')
            return new mainRouter('userId');
        })
    );

    app.use('/', (req: Request, res: Response, next: NextFunction) => {
        // forward to static files if it's a file request
        if (/\..+$/.test(req.path)) {
            return next();
        }

        res.set('Content-Type', 'text/html');
        res.set('Content-Length', indexHtml.length.toString());
        res.end(indexHtml);
    });

    // serve /public as static files
    app.use(express.static('public'));

    app.listen(PORT, () => {
        console.log(`[server]: Server is running at :${PORT}`);
    });
}

main().catch(console.error);
