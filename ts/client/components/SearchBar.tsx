import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { boundMethod } from 'autobind-decorator';
import React from 'react';

import { Container, Form, Icon } from 'react-bulma-components';
import model from '../Model';

import { Item, FindGetter } from '../../common/Types';
import store from '../Store';
import { ISearchAction } from '../reducers/SearchReducer';
import { ItemCard } from './ItemCard';

import './SearchBar.less';
import { keyValuedResultsToArray } from '../../common/Helpers';

import { debounce } from 'debounce';

export interface SearchBarState {
    results: Array<Item>;
    query: string;
}

export class SearchBar extends React.Component<{}, SearchBarState> {
    public state: SearchBarState = {
        results: [],
        query: '',
    };

    async fetch(query: string): Promise<Array<Item>> {
        if (query.length === 0) {
            return;
        }

        const basePath = ['items', 'find', query, { to: 9 }],
            items = await model.get<FindGetter<Item>>(
                [
                    ...basePath,
                    [
                        '_id',
                        'name',
                        'cb',
                        'productor',
                        'um',
                        'submitted',
                        'qnt',
                    ],
                ],
                [...basePath, 'createdBy', ['_id', 'name']],
                [...basePath, 'votes', 'value']
            );

        console.log(items);

        return keyValuedResultsToArray(items.json.items.find[query]);
    }

    @boundMethod
    onChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const query: string = event.target.value.trim();

        this.setState({ query });

        this.search();
    }

    @boundMethod
    onReset(): void {
        this.setState({
            query: '',
            results: [],
        });
    }

    search: typeof this.search_linear = debounce(this.search_linear, 250);

    async search_linear(): Promise<void> {
        const query: string = this.state.query;

        this.setState({
            results: [],
        });

        if (query.length === 0) {
            return;
        }

        store.dispatch<ISearchAction>({
            type: 'SEARCH_FOR',
            data: {
                query,
            },
        });

        this.setState({
            results: await this.fetch(query),
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
            <Container className="search-bar">
                <Form.Control>
                    <Form.Input
                        size="medium"
                        value={this.state.query}
                        onChange={this.onChange}
                        placeholder="Comincia la ricerca da qui :)"
                    />
                    <Icon align="left">
                        <FontAwesomeIcon icon={faSearch} />
                    </Icon>
                    <Icon
                        align="right"
                        className="is-clickable"
                        onClick={this.onReset}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </Icon>
                </Form.Control>
                {this.renderResults()}
            </Container>
        );
    }
}
