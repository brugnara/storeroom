import { KeyValueResults } from './Types';

export function clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
}

export function keyValuedResultsToArray<T>(dict: KeyValueResults<T>): T[] {
    const keys = Object.keys(dict ?? {}).filter(
        (key) => /^[^$]/.test(key) && dict[key] != null
    );

    return keys.map((key) => dict[key] as T);
}
