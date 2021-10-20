import FalcorJsonGraph from 'falcor-json-graph';
import { Document } from 'mongodb';
import { clone } from '../../common/Helpers';
import { IdentificableDoc } from '../../common/Types';

export function fieldsToProjection(fields: Array<string>, _id = 1): Document {
    return fields.reduce(
        (acc, field) => {
            acc[field] = 1;
            return acc;
        },
        { _id }
    );
}

export class Projecter<T extends IdentificableDoc> {
    protected projection: Readonly<Document>;
    protected resolvers: Record<
        string,
        (value: T) => FalcorJsonGraph.Reference
    >;

    constructor(
        projection: Document,
        resolvers?: Record<string, (value: T) => FalcorJsonGraph.Reference>
    ) {
        this.projection = clone(projection);
        this.resolvers = resolvers || {};
    }

    public get project(): Readonly<Document> {
        return this.projection;
    }

    public pick(fields: Array<string>): Readonly<Document> {
        return Object.keys(fields)
            .filter((field) => this.projection[field])
            .reduce((acc, field) => {
                acc[field] = true;
                return acc;
            }, {});
    }

    public toString(): string {
        return JSON.stringify(
            Object.keys(this.projection).filter((key) => this.projection[key])
        );
    }

    public resolve(
        initialPath: Array<FalcorJsonGraph.KeySet>,
        field: string,
        value: T
    ) {
        let result = value[field] ?? null;

        if (this.resolvers[field]) {
            result = this.resolvers[field](value);
        }

        return {
            value: result,
            path: [...initialPath, field],
        };
    }
}
