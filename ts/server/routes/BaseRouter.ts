import { Prefixer } from '../helpers/Prefixer';
import { Collection } from 'mongodb';
import FalcorJsonGraph from 'falcor-json-graph';
import FalcorRouter from 'falcor-router';
import { IdentificableDoc } from '../../common/Types';

export abstract class BaseRouter<T extends IdentificableDoc> {
    protected prefix: string;
    protected collection: Collection<T>;

    abstract byID(): FalcorRouter.RouteDefinition;

    constructor(prefix: string, collection: Collection<T>) {
        if (!Prefixer.isValid) {
            throw new Error('Invalid prefix');
        }

        this.prefix = prefix;
        this.collection = collection;
    }

    public $ref(value: string): FalcorJsonGraph.Reference {
        return FalcorJsonGraph.ref([...this.prefix.split('.'), 'byID', value]);
    }
}
