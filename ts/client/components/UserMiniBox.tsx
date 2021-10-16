import React from 'react';
import { User } from '../../common/Types';

export interface UserMiniBoxProps extends User {
    prepend?: string;
}

export class UserMiniBox extends React.Component<UserMiniBoxProps> {
    get prepend(): string {
        if (!this.props.prepend) {
            return null;
        }
        return this.props.prepend + ' ';
    }

    render(): React.ReactNode {
        return (
            <span>
                {this.prepend}
                {this.props.name}
            </span>
        );
    }
}
