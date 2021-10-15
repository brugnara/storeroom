import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { boundMethod } from 'autobind-decorator';
import React from 'react';

import { Card, Container, Form, Hero, Icon } from 'react-bulma-components';
import model from '../Model';

import { ItemGetter } from '../../common/Types';

export interface SearchBarProps {
    foo?: string;
}

export class SearchBar extends React.Component<SearchBarProps> {
    @boundMethod
    async search(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
        console.log('searching...', event.target.value);

        const items = await model.get<ItemGetter>(
            'itemsFind["pasta"][0..10]["name","cb"]'
        );
        console.log('items', items);
    }

    render(): React.ReactNode {
        return (
            <Hero color="info">
                <Hero.Body>
                    <Container>
                        <Card>
                            <Card.Content>
                                <Form.Control>
                                    <Form.Input
                                        size="large"
                                        onChange={this.search}
                                    />
                                    <Icon align="right">
                                        <FontAwesomeIcon icon={faSearch} />
                                    </Icon>
                                </Form.Control>
                            </Card.Content>
                        </Card>
                    </Container>
                </Hero.Body>
            </Hero>
        );
    }
}
