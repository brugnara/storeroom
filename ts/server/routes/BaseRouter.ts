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

    protected async queryByID(
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

    protected async queryAll(userId: string, options?: FindOptions<T>): Promise<Array<T>> {
        this.log('super.getListedValues', userId, options);

        return await this.collection.find({}, options).toArray();
    }

    protected async countAll(userId: string): Promise<number> {
        this.log('super.countAll', userId);

        return await this.collection.countDocuments({});
    }

    protected searchItems(
        userId: string,
        term: string,
        range: FalcorJsonGraph.Range
    ): Promise<[Array<T>, number]> {
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
                    values = await that.queryByID(this.userId, ids, {
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

                const [items, count] = await that.searchItems(this.userId, term, range);

                ret.push({
                    path: [...pathSet, term, 'count'],
                    value: count,
                });

                for (let i = range.from; i <= range.to; i++) {
                    const item = items[i - range.from],
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

                // add count to ret
                ret.push({
                    path: [...pathSet, 'count'],
                    value: await that.countAll(this.userId),
                });

                let rangesLen = ranges.length;
                while (rangesLen--) {
                    const range = ranges[rangesLen],
                        values = await that.queryAll(this.userId, {
                            projection: (fields && that.allowedFields.pick(fields)) ?? null,
                            skip: range.from,
                            limit: range.to - range.from + 1,
                        });

                    for (let i = range.from; i <= range.to; i++) {
                        const value = values[i - range.from],
                            path: FalcorJsonGraph.PathSet = [...pathSet, i];

                        that.populate(ret, value, path, fields);
                    }
                }

                return ret;
            },
        };
    }
}
