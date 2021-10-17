import express, { Application, NextFunction, Request, Response } from 'express';
import { Document, MongoClient } from 'mongodb';

import fs from 'fs';
import path from 'path';
import falcorExpress from 'falcor-express';
import Router, { RouteResult } from 'falcor-router';
import FalcorJsonGraph, { PathValue, Range } from 'falcor-json-graph';

import { clone } from '../common/Helpers';
import { UsersRouter } from './routes/UsersRouter';
import { Item, ItemFromDB, RoomFromDB, User } from '../common/Types';
import { ItemsRouter } from './routes/ItemsRouter';
import { RoomsRouter } from './routes/RoomsRouter';

const app: Application = express(),
    PORT: number = +(process.env.PORT ?? 8000),
    publicUrl: string = process.env.PUBLIC_URL ?? '',
    indexHtml: string = fs
        .readFileSync(path.join(__dirname, '../../public/index.html'), 'utf8')
        .replace(/%PUBLIC_URL%/g, publicUrl),
    mongoClient = new MongoClient(
        process.env.MONGODB_URI ??
            'mongodb://storeroom:password@0.0.0.0:27017/storeroom'
    );

function fieldsToProjection(fields: Array<string>, _id = 1): Document {
    return fields.reduce(
        (acc, field) => {
            acc[field] = 1;
            return acc;
        },
        { _id }
    );
}

async function main() {
    await mongoClient.connect();

    const collectionItems = mongoClient.db().collection<ItemFromDB>('items'),
        collectionUsers = mongoClient.db().collection<User>('users'),
        collectionRooms = mongoClient.db().collection<RoomFromDB>('rooms'),
        // routers
        usersRouter = new UsersRouter('users', collectionUsers),
        itemsRouter = new ItemsRouter('items', collectionItems, {
            users: usersRouter,
        }),
        roomsRouter = new RoomsRouter('rooms', collectionRooms, {
            users: usersRouter,
        });

    app.use(
        '/model.json',
        falcorExpress.dataSourceRoute(() => {
            // create a Virtual JSON resource with single key ('greeting')
            return new Router([
                usersRouter.byID(),
                //
                itemsRouter.byID(),
                itemsRouter.find(),
                itemsRouter.list(),
                //
                roomsRouter.list(),
            ]);
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
