import { Prefixer } from '../helpers/Prefixer';
import { Collection } from 'mongodb';
import FalcorJsonGraph from 'falcor-json-graph';
import FalcorRouter from 'falcor-router';
import { CompatibleRouters, IdentificableDoc } from '../../common/Types';

export type MountableRouters = Partial<
    Record<CompatibleRouters, BaseRouter<any>>
>;

export abstract class BaseRouter<T extends IdentificableDoc> {
    protected prefix: string;
    protected collection: Collection<T>;
    protected routes: MountableRouters;

    abstract byID(): FalcorRouter.RouteDefinition;

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
        return FalcorJsonGraph.ref([...this.prefix.split('.'), 'byID', value]);
    }
}
