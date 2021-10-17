import { Document } from 'mongodb';
import FalcorJsonGraph from 'falcor-json-graph';
import FalcorRouter from 'falcor-router';
import { BaseRouter } from './BaseRouter';
import { User } from '../../common/Types';
import { Prefixer } from '../helpers/Prefixer';
import { boundMethod } from 'autobind-decorator';

const ANON_USER_NAME = 'Anonimo';

function extractUserProfile(user: Document): Document {
    const profile: Document = user.profile ?? {},
        name: string = (profile.name ?? ANON_USER_NAME).split(/@|\s|\./)[0];

    return {
        _id: user._id,
        name: name[0].toUpperCase() + name.slice(1),
    };
}

export class UsersRouter extends BaseRouter<User> {
    byID(): FalcorRouter.RouteDefinition {
        const that = this;

        return {
            route: Prefixer.join(this.prefix, 'byID[{keys:_id}]'),
            async get(pathSet: FalcorJsonGraph.PathSet) {
                const ids = pathSet.pop() as Array<string>,
                    values = await that.collection
                        .find({
                            _id: { $in: ids },
                        })
                        .toArray(),
                    ret = [];

                values.forEach((value) => {
                    ret.push({
                        value: FalcorJsonGraph.atom(extractUserProfile(value)),
                        path: [...pathSet, value._id],
                    });
                });

                return ret;
            },
        };
    }
}
