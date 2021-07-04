import React from 'react';

import Navbar from 'react-bootstrap/Navbar';
import { connect } from 'react-redux';
import store, { IState } from '../Store';
import { boundMethod } from 'autobind-decorator';
import Nav from 'react-bootstrap/Nav';
import { IUser } from '../reducers/user';
import {Link} from 'react-router-dom';

export interface IHeaderProps {
    user: IUser;
}

export class HeaderComponent extends React.Component<IHeaderProps> {
    @boundMethod
    private onClick(): void {
        store.dispatch({
            type: 'login',
            data: {
                name: 'pippo',
            },
        });
    }

    private renderUserInfo(): React.ReactNode {
        let link = <Link to='/signup'>Signup</Link>;

        if (this.props.user.loggedIn) {
            link = <Link to='/me'>{this.props.user.name}</Link>;
        }

        return <Nav.Item>
            <Nav.Link as='span'>
                {link}
            </Nav.Link>
        </Nav.Item>;
    }

    public render(): React.ReactNode {
        return (
            <Navbar bg="dark" variant="dark">
                <Navbar.Brand href="/">StoreRoom</Navbar.Brand>
                <Nav className="ml-auto ">
                    <Nav.Item>
                        <Nav.Link as='span'>
                            <Link to='/items'>Items</Link>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link as='span'>
                            <Link to='/privacy'>Privacy</Link>
                        </Nav.Link>
                    </Nav.Item>
                    {this.renderUserInfo()}
                </Nav>
            </Navbar>
        );
    }
}

export default connect((state: IState): IHeaderProps => ({
    user: state?.user ?? null,
}))(HeaderComponent);
