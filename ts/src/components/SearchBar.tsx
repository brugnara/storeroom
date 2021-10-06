import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

import {Card, Container, Form, Hero, Icon} from 'react-bulma-components';

export interface SearchBarProps {
    foo?: string;
}

export class SearchBar extends React.Component<SearchBarProps> {
    render(): React.ReactNode {
        return <Hero color='info'>
            <Hero.Body>
                <Container>
                    <Card>
                        <Card.Content>
                            <Form.Control>
                                <Form.Input size='large'/>
                                <Icon align="right">
                                    <FontAwesomeIcon icon={faSearch} />
                                </Icon>
                            </Form.Control>
                        </Card.Content>
                    </Card>
                </Container>
            </Hero.Body>
        </Hero>;
    }
}
