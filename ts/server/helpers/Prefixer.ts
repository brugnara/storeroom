export class Prefixer {
    public static isValid(prefix: string): boolean {
        return prefix != null && prefix.length > 0;
    }

    public static join(prefix: string, path: string): string {
        if (!Prefixer.isValid(prefix)) {
            throw new Error(`Invalid prefix: ${prefix}`);
        }

        return `${prefix}.${path}`;
    }
}
