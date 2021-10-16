import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { boundMethod } from 'autobind-decorator';
import React from 'react';

import { Card, Container, Form, Hero, Icon } from 'react-bulma-components';
import model from '../Model';

import { ItemsFindGetter, ItemsListedResults } from '../../common/Types';
import store from '../Store';
import { ISearchAction } from '../reducers/SearchReducer';
import { ItemCard } from './ItemCard';

import './SearchBar.less';

export interface SearchBarProps {
    foo?: string;
}

export interface SearchBarState {
    results: ItemsListedResults;
}

setInterval(() => {
    // console.log(model.getCache());
}, 2000);

export class SearchBar extends React.Component<SearchBarProps> {
    public state: SearchBarState = {
        results: null,
    };

    get resultsKeys(): Array<string> {
        return Object.keys(this.state?.results ?? {}).filter((key) =>
            /^[^$]/.test(key)
        );
    }

    get resultsCount(): number {
        const keys = this.resultsKeys;

        if (keys.length === 0) {
            return 0;
        }

        return keys.reduce((acc, key) => {
            if (this.state.results[key] != null) {
                acc++;
            }

            return acc;
        }, 0);
    }

    @boundMethod
    async search(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
        this.setState({
            results: null,
        });

        const query: string = event.target.value,
            items = await model.get<ItemsFindGetter>([
                'itemsFind',
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

        this.setState({ results: items.json.itemsFind[query] });
    }

    renderResults(): React.ReactNode {
        if (this.resultsCount === 0) {
            return null;
        }

        const cards = this.resultsKeys
            .filter((key) => this.state.results[key])
            .map((key) => {
                return <ItemCard key={key} {...this.state.results[key]} />;
            });

        return (
            <Container className="results">
                <h1>{this.resultsCount} result(s)</h1>
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
