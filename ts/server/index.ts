import express, { Application, NextFunction, Request, Response } from 'express';
import { Document, MongoClient } from 'mongodb';

import fs from 'fs';
import path from 'path';
import falcorExpress from 'falcor-express';
import Router, { RouteResult } from 'falcor-router';
import FalcorJsonGraph, { atom, PathValue, Range } from 'falcor-json-graph';

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

    const collection = mongoClient.db().collection('items');

    app.use(
        '/model.json',
        falcorExpress.dataSourceRoute(() => {
            // create a Virtual JSON resource with single key ('greeting')
            return new Router([
                {
                    route: 'itemByIDOK[{keys:_id}][{keys:props}]',
                    async get(pathSet: FalcorJsonGraph.PathSet) {
                        console.log('itemID', pathSet);

                        const ids = pathSet[1] as Array<string>,
                            fields = pathSet[2] as Array<string>,
                            values = await collection
                                .find({
                                    _id: { $in: ids },
                                })
                                .toArray();

                        const mapped = values.reduce((acc, value) => {
                            fields.forEach((field) => {
                                acc.push({
                                    path: [pathSet[0], value._id, field],
                                    value: value[field],
                                });
                            });
                            return acc;
                        }, []);

                        console.dir(mapped);

                        return mapped as RouteResult;
                    },
                },
                {
                    route: 'itemByID[{keys:_id}]',
                    async get(pathSet: FalcorJsonGraph.PathSet) {
                        console.log('itemID', pathSet);

                        const ids = pathSet[1] as Array<string>,
                            values = await collection
                                .find({
                                    _id: { $in: ids },
                                })
                                .toArray();

                        const mapped = values.reduce((acc, value) => {
                            acc.push({
                                path: [pathSet[0], value._id],
                                value: atom(value),
                            });
                            return acc;
                        }, []);

                        console.dir(mapped);

                        return mapped as RouteResult;
                    },
                },
                {
                    route: 'items[{ranges:indexRanges}]',
                    async get(pathSet: FalcorJsonGraph.PathSet) {
                        const range = pathSet[1] as Range,
                            values = await collection
                                .find({}, { _id: 1 } as Document)
                                .sort({})
                                .skip(range[0].from)
                                .limit(range[0].to)
                                .toArray();

                        const ret: Array<PathValue> = [];

                        values.forEach((value, index) => {
                            ret.push({
                                path: [pathSet[0], index],
                                value: FalcorJsonGraph.ref([
                                    'itemByID',
                                    value._id,
                                ]),
                            });
                        });

                        return ret;
                    },
                },
                {
                    route: 'itemsFind[{keys:terms}][{ranges}]',
                    async get(pathSet: FalcorJsonGraph.PathSet) {
                        const terms = pathSet[1] as Array<string>,
                            range = pathSet[2] as Array<Range>;

                        if (range.length !== 1) {
                            throw new Error('Only one range is supported');
                            return [];
                        }

                        const values = await collection
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
                                                description: {
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
                            .limit(range[0].to)
                            .toArray();

                        return values.map((value, index) => ({
                            path: [pathSet[0], pathSet[1][0], index],
                            value: FalcorJsonGraph.ref(['itemByID', value._id]),
                        }));
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
