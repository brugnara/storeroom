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
    protected projection: Readonly<Partial<Record<keyof T, number | boolean>>>;
    protected resolvers: Partial<Record<keyof T, (value: T) => FalcorJsonGraph.Reference>>;

    constructor(
        projection: Partial<Record<keyof T, number | boolean>>,
        resolvers?: Partial<Record<keyof T, (value: T) => FalcorJsonGraph.Reference>>
    ) {
        this.projection = clone(projection);
        this.resolvers = resolvers || null;
    }

    public get project(): Readonly<Document> {
        return this.projection;
    }

    public pick(fields: Array<keyof T>): Readonly<Document> {
        return Object.keys(fields)
            .filter((field) => !this.projection || this.projection[field])
            .reduce((acc, field) => {
                acc[field] = true;
                return acc;
            }, {});
    }

    public toString(): string {
        return JSON.stringify(Object.keys(this.projection).filter((key) => this.projection[key]));
    }

    public resolve(initialPath: Array<FalcorJsonGraph.KeySet>, field: keyof T, value: T) {
        let result: T[keyof T] | FalcorJsonGraph.Reference = value[field] ?? null;

        if (this.resolvers && this.resolvers[field]) {
            result = this.resolvers[field](value);
        }

        return {
            value: result,
            path: [...initialPath, field],
        };
    }
}
