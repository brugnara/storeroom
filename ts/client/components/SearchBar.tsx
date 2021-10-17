import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { boundMethod } from 'autobind-decorator';
import React from 'react';

import { Card, Container, Form, Hero, Icon } from 'react-bulma-components';
import model from '../Model';

import { Item, FindGetter, KeyValueResults } from '../../common/Types';
import store from '../Store';
import { ISearchAction } from '../reducers/SearchReducer';
import { ItemCard } from './ItemCard';

import './SearchBar.less';
import { keyValuedResultsToArray } from '../../common/Helpers';

export interface SearchBarState {
    results: Array<Item>;
}

export class SearchBar extends React.Component<{}, SearchBarState> {
    public state: SearchBarState = {
        results: [],
    };

    @boundMethod
    async search(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
        this.setState({
            results: [],
        });

        // todo: split query into an array and handle each result accordingly
        const query: string = event.target.value.trim();

        if (query.length === 0) {
            return;
        }

        const items = await model.get<FindGetter<Item>>([
            'items',
            'find',
            query,
            { to: 9 },
            [
                '_id',
                'name',
                'cb',
                'productor',
                'um',
                'submitted',
                'qnt',
                'createdBy',
            ],
            ['_id', 'name'],
        ]);

        store.dispatch<ISearchAction>({
            type: 'SEARCH_FOR',
            data: {
                query: event.target.value,
            },
        });

        this.setState({
            results: keyValuedResultsToArray(items.json.items.find[query]),
        });
    }

    renderResults(): React.ReactNode {
        if (this.state.results.length === 0) {
            return null;
        }

        const cards = this.state.results.map((result) => {
            return <ItemCard key={result._id} {...result} />;
        });

        return (
            <Container className="results">
                <h1>{this.state.results.length} result(s)</h1>
                {cards}
            </Container>
        );
    }

    render(): React.ReactNode {
        return (
            <div className="search-bar">
                <Hero color="info">
                    <Hero.Body>
                        <Container>
                            <Card>
                                <Card.Content>
                                    <Form.Control>
                                        <Form.Input
                                            size="large"
                                            onChange={this.search}
                                            placeholder="Comincia la ricerca da qui :)"
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
            </div>
        );
    }
}
