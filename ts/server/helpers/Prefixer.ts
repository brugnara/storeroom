import { Stringable } from '../../common/Types';

export class Prefixer {
    public static isValid(prefix: string): boolean {
        return prefix != null && prefix.length > 0;
    }

    public static join(
        prefix: string,
        path: string,
        allowedFields?: Stringable
    ): string {
        if (!Prefixer.isValid(prefix)) {
            throw new Error(`Invalid prefix: ${prefix}`);
        }

        const ret = `${prefix}.${path}${
            allowedFields ? allowedFields.toString() : ''
        }`;

        console.log(`Prefixer.join: ${ret}`);

        return ret;
    }

    public static byID(prefix: string, allowedFields?: Stringable): string {
        return Prefixer.join(prefix, 'byID[{keys:_id}]', allowedFields);
    }

    public static list(prefix: string): string {
        return Prefixer.join(prefix, 'list[{ranges:indexRanges}]');
    }
}
