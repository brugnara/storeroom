import React from 'react';

import { connect } from 'react-redux';
import store, { IState } from '../Store';
import { boundMethod } from 'autobind-decorator';
import { IUser } from '../reducers/user';
import {Link} from 'react-router-dom';
import { Container, Navbar } from 'react-bulma-components';
import { SearchBar } from '../components/SearchBar';
import { CallToAction } from '../components/CallToAction';

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

        return <Navbar.Item renderAs='span'>
            {link}
        </Navbar.Item>;
    }

    private renderMenu(): React.ReactNode {
        return (
            <Container>
                <Navbar>
                    <Navbar.Brand>
                        <Navbar.Item href="/">
                            SR
                        </Navbar.Item>
                    </Navbar.Brand>
                    <Navbar.Menu className="ml-auto ">
                        <Navbar.Container>
                            <Navbar.Item renderAs='span'>
                                <Link to='/items'>Items</Link>
                            </Navbar.Item>
                            <Navbar.Item renderAs='span'>
                                <Link to='/privacy'>Privacy</Link>
                            </Navbar.Item>
                            {this.renderUserInfo()}
                        </Navbar.Container>
                    </Navbar.Menu>
                </Navbar>
            </Container>

        );
    }

    public render(): React.ReactNode {
        return <>
            {this.renderMenu()}
            <SearchBar />
            <CallToAction />
        </>;
    }
}

export default connect((state: IState): IHeaderProps => ({
    user: state?.user ?? null,
}))(HeaderComponent);
