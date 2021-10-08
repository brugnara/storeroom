import express, { Application, NextFunction, Request, Response } from 'express';
import { MongoClient } from 'mongodb';

import fs from 'fs';
import path from 'path';
import falcorExpress from 'falcor-express';
import Router from 'falcor-router';

const app: Application = express(),
    PORT: number = +(process.env.PORT ?? 8000),
    publicUrl: string = process.env.PUBLIC_URL ?? '',
    indexHtml: string = fs
        .readFileSync(path.join(__dirname, '../public/index.html'), 'utf8')
        .replace(/%PUBLIC_URL%/g, publicUrl),
    mongoClient = new MongoClient(
        process.env.MONGODB_URI ??
            'mongodb://storeroom:password@0.0.0.0:27017/storeroom'
    );

async function main() {
    await mongoClient.connect();

    const collection = mongoClient.db().collection('items');

    app.use(
        '/model.json',
        falcorExpress.dataSourceRoute(() => {
            // create a Virtual JSON resource with single key ('greeting')
            return new Router([
                {
                    route: 'item.name',
                    async get() {
                        const value = await collection.findOne();
                        return { path: ['item', 'name'], value: value.name };
                    },
                },
                {
                    route: 'item.cb',
                    async get() {
                        const value = await collection.findOne();
                        return { path: ['item', 'cb'], value: value.cb };
                    },
                },
            ]);
        })
    );

    app.use('/', (req: Request, res: Response, next: NextFunction) => {
        if (req.path !== '/') {
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
