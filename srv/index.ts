import express, { Application, NextFunction, Request, Response } from 'express';

import fs from 'fs';
import path from 'path';
import falcorExpress from 'falcor-express';
import Router from 'falcor-router';

const app: Application = express(),
    PORT: number = +(process.env.PORT ?? 8000),
    publicUrl: string = process.env.PUBLIC_URL ?? '',
    indexHtml: string = fs
        .readFileSync(path.join(__dirname, '../public/index.html'), 'utf8')
        .replace(/%PUBLIC_URL%/g, publicUrl);

app.use(
    '/items.json',
    falcorExpress.dataSourceRoute((req: Request, res: Response) => {
        if (req.path == '/ciccio') {
            res.end('pasticcio');
        }

        // create a Virtual JSON resource with single key ('greeting')
        return new Router([
            {
                // match a request for the key 'greeting'
                route: 'greeting',
                // respond with a PathValue with the value of 'Hello World.'
                get: function () {
                    return { path: ['greeting'], value: 'Hello World' };
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
