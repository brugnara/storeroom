import React from 'react';
import Body from './Body';
import Container from 'react-bootstrap/Container';

import Header from './Header';

export class Layout extends React.Component {
    public render(): React.ReactNode {
        return (
            <Container>
                <Header />
                <Body />
            </Container>
        );
    }
}
