import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { boundMethod } from 'autobind-decorator';
import React from 'react';

import { Card, Container, Form, Hero, Icon } from 'react-bulma-components';
import model from '../Model';

import { Item, ItemsFindGetter } from '../../common/Types';
import store from '../Store';
import { ISearchAction } from '../reducers/SearchReducer';

export interface SearchBarProps {
    foo?: string;
}

export interface SearchBarState {
    results: Array<Item>;
}

setInterval(() => {
    // console.log(model.getCache());
}, 2000);

export class SearchBar extends React.Component<SearchBarProps> {
    public state: SearchBarState = {
        results: [],
    };

    @boundMethod
    async search(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
        const query: string = event.target.value;

        console.log('searching...', query);

        // model.get('userByID["2LAKhbPSAi2A3ffvZ"].profile').subscribe(console.log);
        // model.get('userByID["2LAKhbPSAi2A3ffvZ"].createdAt').subscribe(console.log);
        // model.get(['itemByID', '228uunY3LMzANmFNo', 'createdBy', 'profile', null]).then(console.log);
        // model.get('itemByID["228uunY3LMzANmFNo"].createdBy.name').then(console.log);
        // model.get(['itemByID', '228uunY3LMzANmFNo', 'createdBy', 'name']).then(console.log);
        // model.get('itemByID["228uunY3LMzANmFNo"].userProfile.name').then(console.log);

        // const mm: any = await model.get('itemByID["228uunY3LMzANmFNo"].createdBy');

        // console.log(mm.profile);

        const items = await model.get<ItemsFindGetter>(
            [
                'itemsFind',
                query,
                { to: 9 },
                ['_id', 'name', 'cb', 'productor', 'createdBy'],
                ['name', '_id'],
            ]
            // `itemsFind['${query}'][0..9]['name','cb','productor','createdBy.profile']`
        );

        store.dispatch<ISearchAction>({
            type: 'SEARCH_FOR',
            data: {
                query: event.target.value,
            },
        });

        this.setState({ results: items.json.itemsFind });
    }

    renderResults(): React.ReactNode {
        return <pre>{JSON.stringify(this.state?.results, null, 2)}</pre>;
    }

    render(): React.ReactNode {
        return (
            <>
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
                {this.renderResults()}
            </>
        );
    }
}
