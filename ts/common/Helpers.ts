import { IdentificableDoc, KeyValueResults } from './Types';
import { Document } from 'bson';

export function clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
}

export function keyValuedResultsToArray<T>(dict: KeyValueResults<T>): T[] {
    const keys = Object.keys(dict ?? {}).filter(
        (key) => /^[^$]/.test(key) && dict[key] != null
    );

    return keys.map((key) => dict[key] as T);
}

export function identificablesToObject(
    items: Array<IdentificableDoc>
): Document {
    return items.reduce<Document>((acc, item) => {
        acc[item._id] = item;
        return acc;
    }, {});
}
