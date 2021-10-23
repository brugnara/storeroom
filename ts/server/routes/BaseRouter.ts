import { Prefixer } from '../helpers/Prefixer';
import { Collection, Filter, FindOptions } from 'mongodb';
import FalcorJsonGraph from 'falcor-json-graph';
import FalcorRouter from 'falcor-router';
import { CompatibleRouters, IdentificableDoc } from '../../common/Types';
import { Projecter } from '../helpers/Projecter';

export type MountableRouters = Partial<Record<CompatibleRouters, BaseRouter<any>>>;

export abstract class BaseRouter<T extends IdentificableDoc> {
    protected prefix: string;
    protected collection: Collection<T>;
    protected routes: MountableRouters;
    protected abstract allowedFields: Projecter<T>;
    protected authRequired: boolean = false;
    protected patch: Partial<Record<keyof T, (document: T) => FalcorJsonGraph.Key>> = null;

    protected log(...args: any) {
        console.log(`[${this.prefix}]`, ...args);
    }

    protected async getValuesByID(
        userId: string,
        ids: Array<string>,
        options?: FindOptions<T>
    ): Promise<Array<T>> {
        this.log('super.getValuesByID', userId, ids, options);

        return await this.collection
            .find(
                {
                    _id: { $in: ids },
                } as Filter<T>,
                options
            )
            .toArray();
    }

    protected async getListedValues(userId: string, options?: FindOptions<T>): Promise<Array<T>> {
        this.log('super.getListedValues', userId, options);

        return await this.collection.find({}, options).toArray();
    }

    protected searchItems(
        userId: string,
        term: string,
        range: FalcorJsonGraph.Range
    ): Promise<Array<T>> {
        this.log('super.searchItems', userId, term, range);
        throw new Error('Not implemented');
    }

    constructor(prefix: string, collection: Collection<T>, routes?: MountableRouters) {
        if (!Prefixer.isValid) {
            throw new Error('Invalid prefix');
        }

        this.prefix = prefix;
        this.collection = collection;
        this.routes = routes;
    }

    public $ref(value: string): FalcorJsonGraph.Reference {
        this.log('$ref', value);
        return FalcorJsonGraph.ref([...this.prefix.split('.'), 'byID', value]);
    }

    public get authenticated() {
        return new Proxy(this, {
            get: (target, prop, receiver) => {
                if (prop === 'authRequired') {
                    return true;
                }
                return Reflect.get(target, prop, receiver);
            },
        });
    }

    protected checkAuth(behaviour: 'default' | 'force-auth-check' = 'default') {
        const required = behaviour === 'force-auth-check' || this.authRequired;

        if (required && !this.authenticated) {
            throw new Error('Not authenticated');
        }
    }

    protected populate(
        ret: Array<FalcorJsonGraph.PathValue>,
        value: T,
        path: FalcorJsonGraph.PathSet,
        fields?: Array<keyof T>
    ) {
        if (value == null) {
            ret.push({
                path,
                value: null,
            });

            return;
        }

        if (!fields) {
            this.log('No fields asked!!!!!');
            ret.push({
                path,
                value,
            });

            return;
        }

        // iterate over fields and compose the response
        if (!Array.isArray(fields)) {
            fields = [fields];
        }

        fields.forEach((field) => {
            if (this.patch && this.patch[field]) {
                ret.push({
                    path: [...path, field] as typeof path,
                    value: this.patch[field](value),
                });
                return;
            }
            ret.push(this.allowedFields.resolve(path, field, value));
        });
    }

    public byID(): FalcorRouter.RouteDefinition {
        const route = Prefixer.join(this.prefix, 'byID[{keys:id}]', this.allowedFields),
            that = this;

        this.log('ROUTER:', this.authRequired ? 'AUTH' : 'UNAUTH', route);

        return {
            route,
            async get(pathSet: FalcorJsonGraph.PathSet) {
                that.checkAuth.call(this);

                let fields = that.allowedFields && (pathSet.pop() as Array<keyof T>),
                    ids = pathSet.pop() as Array<string>,
                    values = await that.getValuesByID(this.userId, ids, {
                        projection: (fields && that.allowedFields.pick(fields)) ?? null,
                    }),
                    ret: Array<FalcorJsonGraph.PathValue> = [];

                that.log(ids, fields, values?.length ?? 0);

                ids.forEach((id) => {
                    const value: T = values.find((v: T) => v?._id === id) || null,
                        path = [...pathSet, id];

                    that.populate(ret, value, path, fields);
                });

                return ret;
            },
        };
    }

    public find(): FalcorRouter.RouteDefinition {
        const route = Prefixer.join(this.prefix, 'find[{keys:terms}][{ranges}]'),
            that = this;

        return {
            route,
            async get(pathSet: FalcorJsonGraph.PathSet) {
                that.checkAuth.call(this);

                const ranges = pathSet.pop() as Array<FalcorJsonGraph.Range>,
                    ret = [];

                if (ranges.length !== 1) {
                    throw new Error('Only one range is supported');
                }

                let terms = pathSet.pop() as Array<string>;
                terms = terms.map((term) => `${term}`.trim()).filter((term) => term.length > 0);
                const term = (terms && terms[0]) ?? null,
                    range = ranges[0];

                if (!term) {
                    throw new Error('No term provided');
                }

                const items = await that.searchItems(this.userId, term, range);

                for (let i = range.from; i <= range.to; i++) {
                    const item = items[i],
                        path = [...pathSet, term, i],
                        value = item ? that.$ref(item._id) : null;

                    ret.push({
                        path,
                        value,
                    });
                }

                return ret;
            },
        };
    }

    public list(): FalcorRouter.RouteDefinition {
        const route = Prefixer.join(this.prefix, 'list[{ranges}]', this.allowedFields),
            that = this;

        this.log('ROUTER:', this.authRequired ? 'AUTH' : 'UNAUTH', route);

        return {
            route,
            async get(pathSet: FalcorJsonGraph.PathSet) {
                that.checkAuth.call(this);

                const fields = that.allowedFields && (pathSet.pop() as Array<keyof T>),
                    ranges = pathSet.pop() as Array<FalcorJsonGraph.Range>,
                    ret = [];

                let rangesLen = ranges.length;

                while (rangesLen--) {
                    const range = ranges[rangesLen],
                        values = await that.getListedValues(this.userId, {
                            projection: (fields && that.allowedFields.pick(fields)) ?? null,
                            skip: range.from,
                            limit: range.to,
                        });

                    for (let i = range.from; i <= range.to; i++) {
                        const value = values[i],
                            path: FalcorJsonGraph.PathSet = [...pathSet, i];

                        that.populate(ret, value, path, fields);
                    }
                }

                return ret;
            },
        };
    }

    protected keyedAndRangedResults(
        route: string,
        getQuery: (id: string, userId: string) => Filter<T>
    ) {
        const that = this;

        console.log('requires auth?', this.authRequired);

        return {
            route,
            async get(pathSet: FalcorJsonGraph.PathSet) {
                that.checkAuth();

                const askedFields = pathSet.pop() as Array<keyof T>,
                    range = pathSet.pop() as Array<FalcorJsonGraph.Range>,
                    ids = pathSet.pop() as Array<string>,
                    ret = [];

                let len = ids.length;

                while (len--) {
                    const id = ids[len],
                        values = await that.collection
                            .find(getQuery(id, this.userId), that.allowedFields.pick(askedFields))
                            .skip(range[0].from)
                            .limit(range[0].to + 1)
                            .toArray();

                    for (let i = range[0].from; i <= range[0].to; i++) {
                        const stock = values[i - range[0].from] || null,
                            initialPath = [...pathSet, id, i];

                        if (!stock) {
                            ret.push({
                                path: [...initialPath],
                                value: null,
                            });
                            continue;
                        }

                        askedFields.forEach((field) => {
                            ret.push(that.allowedFields.resolve(initialPath, field, stock));
                        });
                    }
                }

                console.log(JSON.stringify(ret));

                return ret;
            },
        };
    }
}
