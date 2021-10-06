import React from 'react';
import Body from './Body';

import Header from './Header';

import {Container} from 'react-bulma-components';

export class Layout extends React.Component {
    public render(): React.ReactNode {
        return (
            <>
                <Header />
                <Container>
                    <Body />
                </Container>
            </>
        );
    }
}
