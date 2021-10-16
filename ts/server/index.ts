import express, { Application, NextFunction, Request, Response } from 'express';
import { Document, MongoClient } from 'mongodb';

import fs from 'fs';
import path from 'path';
import falcorExpress from 'falcor-express';
import Router, { RouteResult } from 'falcor-router';
import FalcorJsonGraph, {
    atom,
    error,
    PathValue,
    Range,
} from 'falcor-json-graph';

import { clone } from '../common/Helpers';

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

function extractUserProfile(user: Document): Document {
    const profile: Document = user.profile ?? {},
        name: string = (profile.name ?? 'MisterX').split(/@|\s|\./)[0];

    return {
        _id: user._id,
        name: name[0].toUpperCase() + name.slice(1),
    };
}

async function main() {
    await mongoClient.connect();

    const collectionItems = mongoClient.db().collection('items');
    const collectionUsers = mongoClient.db().collection('users');

    app.use(
        '/model.json',
        falcorExpress.dataSourceRoute(() => {
            // create a Virtual JSON resource with single key ('greeting')
            return new Router([
                {
                    route: 'userByID[{keys:_id}]',
                    async get(pathSet: FalcorJsonGraph.PathSet) {
                        console.log('userByID', pathSet);

                        const ids = pathSet[1] as Array<string>,
                            values = await collectionUsers
                                .find({
                                    _id: { $in: ids },
                                })
                                .toArray();

                        console.log(values);

                        const mapped = values.reduce((acc, value) => {
                            acc.push({
                                value: FalcorJsonGraph.atom(
                                    extractUserProfile(value)
                                ),
                                path: [pathSet[0], value._id],
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
                        const ids = pathSet[1] as Array<string>,
                            values = await collectionItems
                                .find(
                                    {
                                        _id: { $in: ids },
                                    },
                                    {
                                        _id: 1,
                                        productor: 1,
                                        name: 1,
                                        createdBy: 1,
                                        cb: 1,
                                    } as Document
                                )
                                .toArray();

                        const mapped = values.reduce((acc, value) => {
                            acc.push(
                                {
                                    value,
                                    path: [pathSet[0], value._id],
                                },
                                {
                                    value: FalcorJsonGraph.ref([
                                        'userByID',
                                        value.createdBy,
                                    ]),
                                    path: [pathSet[0], value._id, 'createdBy'],
                                }
                            );
                            return acc;
                        }, []);

                        console.log(JSON.stringify(mapped[0]), '\n');

                        return mapped as RouteResult;
                    },
                },
                {
                    route: 'items[{ranges:indexRanges}]',
                    async get(pathSet: FalcorJsonGraph.PathSet) {
                        const range = pathSet[1] as Range,
                            values = await collectionItems
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
                            range = pathSet[2] as Array<Range>,
                            ret = [];

                        if (range.length !== 1) {
                            throw new Error('Only one range is supported');
                        }

                        const values = await collectionItems
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
                            .limit(Math.min(range[0].to + 1, 100))
                            .toArray();

                        for (let i = range[0].from; i <= range[0].to; i++) {
                            const value =
                                values[i - range[0].from] == null
                                    ? null
                                    : FalcorJsonGraph.ref([
                                          'itemByID',
                                          values[i]._id,
                                      ]);

                            ret.push({
                                value,
                                path: [pathSet[0], pathSet[1][0], i],
                            });
                        }

                        return ret;
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
