import { Prefixer } from '../helpers/Prefixer';
import { Collection, Filter, FindOptions } from 'mongodb';
import FalcorJsonGraph from 'falcor-json-graph';
import FalcorRouter from 'falcor-router';
import { CompatibleRouters, IdentificableDoc } from '../../common/Types';
import { Projecter } from '../helpers/Projecter';

export type MountableRouters = Partial<
    Record<CompatibleRouters, BaseRouter<any>>
>;

export abstract class BaseRouter<T extends IdentificableDoc> {
    protected prefix: string;
    protected collection: Collection<T>;
    protected routes: MountableRouters;
    protected abstract allowedFields: Projecter<T>;
    protected authRequired: boolean = false;
    protected patch: Partial<
        Record<keyof T, (document: T) => FalcorJsonGraph.Key>
    > = null;

    protected log(...args: any) {
        console.log(`[${this.prefix}]`, ...args);
    }

    protected async getValues(
        userId: string,
        ids: Array<string>,
        options?: FindOptions<T>
    ): Promise<Array<T>> {
        this.log('getValues', userId, ids, options);
        return await this.collection
            .find(
                {
                    _id: { $in: ids },
                } as Filter<T>,
                options
            )
            .toArray();
    }

    constructor(
        prefix: string,
        collection: Collection<T>,
        routes?: MountableRouters
    ) {
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

    protected get authenticated() {
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

    public byID(): FalcorRouter.RouteDefinition {
        const route = Prefixer.join(
                this.prefix,
                'byID[{keys}]',
                this.allowedFields
            ),
            that = this;

        return {
            route,
            async get(pathSet: FalcorJsonGraph.PathSet) {
                try {
                    const fields =
                            that.allowedFields &&
                            (pathSet.pop() as Array<keyof T>),
                        ids = pathSet.pop() as Array<string>,
                        values = await that.getValues(this.userId, ids, {
                            projection:
                                (fields && that.allowedFields.pick(fields)) ??
                                null,
                        }),
                        ret = [];

                    that.log(ids, fields, values?.length ?? 0);

                    ids.forEach((id) => {
                        const value: T =
                                values.find((v: T) => v?._id === id) || null,
                            path = [...pathSet, id];

                        if (value == null) {
                            ret.push({
                                path,
                                value: null,
                            });

                            return;
                        }

                        if (!fields) {
                            that.log('No fields asked!!!!!');
                            ret.push({
                                path,
                                value,
                            });

                            return;
                        }

                        // iterate over fields and compose the response
                        fields.forEach((field) => {
                            if (that.patch && that.patch[field]) {
                                ret.push({
                                    path: [...path, field],
                                    value: that.patch[field](value),
                                });
                                return;
                            }
                            ret.push(
                                that.allowedFields.resolve(path, field, value)
                            );
                        });
                    });

                    that.log('ROSALBA', ret);

                    return ret;
                } catch (e) {
                    that.log(e);
                    throw e;
                }
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
                            .find(
                                getQuery(id, this.userId),
                                that.allowedFields.pick(askedFields)
                            )
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
                            ret.push(
                                that.allowedFields.resolve(
                                    initialPath,
                                    field,
                                    stock
                                )
                            );
                        });
                    }
                }

                console.log(JSON.stringify(ret));

                return ret;
            },
        };
    }
}
