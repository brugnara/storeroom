import { BaseRouter } from './BaseRouter';
import { User } from '../../common/Types';
import { Projecter } from '../helpers/Projecter';

const ANON_USER_NAME = 'Anonimo';

function patchName(name: string): string {
    name = (name ?? ANON_USER_NAME).split(/@|\s|\./)[0];

    return name[0].toUpperCase() + name.slice(1);
}

export class UsersRouter extends BaseRouter<User> {
    protected allowedFields = new Projecter<User>({
        _id: 1,
        name: 1,
    });

    protected patch = {
        name: (doc: User) => patchName(doc.profile?.name),
    };
}
