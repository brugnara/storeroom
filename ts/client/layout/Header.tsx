import React from 'react';

import { connect } from 'react-redux';
import { IState } from '../Store';
import { IUser } from '../reducers/UserReducer';
import { Link } from 'react-router-dom';
import { Container, Navbar } from 'react-bulma-components';

export interface IHeaderProps {
    user: IUser;
}

export class HeaderComponent extends React.Component<IHeaderProps> {
    private renderUserInfo(): React.ReactNode {
        let link = <Link to="/signup">Signup</Link>;

        if (this.props.user.loggedIn) {
            link = <Link to="/me">{this.props.user.name}</Link>;
        }

        return <Navbar.Item renderAs="span">{link}</Navbar.Item>;
    }

    private renderMenu(): React.ReactNode {
        return (
            <Container>
                <Navbar>
                    <Navbar.Brand>
                        <Navbar.Item href="/">SR</Navbar.Item>
                    </Navbar.Brand>
                    <Navbar.Menu className="ml-auto ">
                        <Navbar.Container>
                            <Navbar.Item renderAs="span">
                                <Link to="/items">Items</Link>
                            </Navbar.Item>
                            <Navbar.Item renderAs="span">
                                <Link to="/rooms">Rooms</Link>
                            </Navbar.Item>
                            <Navbar.Item renderAs="span">
                                <Link to="/privacy">Privacy</Link>
                            </Navbar.Item>
                            {this.renderUserInfo()}
                        </Navbar.Container>
                    </Navbar.Menu>
                </Navbar>
            </Container>
        );
    }

    public render(): React.ReactNode {
        return <>{this.renderMenu()}</>;
    }
}

export default connect(
    (state: IState): IHeaderProps => ({
        user: state?.user ?? null,
    })
)(HeaderComponent);
