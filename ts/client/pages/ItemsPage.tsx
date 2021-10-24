import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { boundMethod } from 'autobind-decorator';
import React from 'react';

import { Box, Button, Container, Form, Icon } from 'react-bulma-components';

import { Item, FindGetter, CountableResult } from '../../common/Types';
import store from '../Store';
import { ISearchAction } from '../reducers/SearchReducer';

import './ItemsPage.less';
import { keyValuedResultsToArray } from '../../common/Helpers';

import { debounce } from 'debounce';
import { BUSLayer } from '../helpers/BUSLayer';
import { ItemsRender } from '../components/ItemsRender';
import FalcorJsonGraph from 'falcor-json-graph';

const PAGE_SIZE = 10;

export interface ItemsPageState extends CountableResult {
    results: Array<Item>;
    query: string;
    page: number;
}

export class ItemsPage extends BUSLayer<{}, ItemsPageState> {
    public state: ItemsPageState = {
        results: [],
        count: 0,
        query: '',
        page: 0,
    };

    protected get range(): FalcorJsonGraph.Range {
        return {
            from: this.state.page * PAGE_SIZE,
            to: (this.state.page + 1) * PAGE_SIZE - 1,
        };
    }

    componentDidUpdate(_prevProps: {}, prevState: ItemsPageState): void {
        if (this.state.page !== prevState.page) {
            this.search();
        }
    }

    async fetch(query: string): Promise<[Array<Item>, number]> {
        if (query.length === 0) {
            return;
        }

        const basePath = ['items', 'find', query, this.range],
            items = await this.model.get<FindGetter<Item>>(
                ['items', 'find', query, 'count'],
                [...basePath, ['_id', 'name', 'cb', 'productor', 'um', 'submitted', 'qnt']],
                [...basePath, 'createdBy', ['_id', 'name']],
                [...basePath, 'votes', ['voteCount']]
            );

        console.log(items, this.range);

        return [
            keyValuedResultsToArray(items.json.items.find[query]),
            items.json.items.find[query].count,
        ];
    }

    @boundMethod
    onChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const query: string = event.target.value;

        this.setState({ query, page: 0 });
        this.search();
    }

    @boundMethod
    onReset(): void {
        this.setState({
            query: '',
            count: 0,
            page: 0,
            results: [],
        });
    }

    search: typeof this.searchLinear = debounce(this.searchLinear, 250);

    async searchLinear(): Promise<void> {
        const query: string = this.state.query.trim();

        if (query.length === 0) {
            return;
        }

        this.setState({
            results: [],
        });

        store.dispatch<ISearchAction>({
            type: 'SEARCH_FOR',
            data: {
                query,
            },
        });

        const [results, count] = await this.fetch(query);

        console.log(results, count);

        this.setState({
            results,
            count,
        });
    }

    @boundMethod
    onNext(): void {
        this.setState((state) => ({
            page: state.page + 1,
        }));
    }

    @boundMethod
    onPrev(): void {
        this.setState((state) => ({
            page: state.page - 1,
        }));
    }

    canNext(): boolean {
        return (this.state.page + 1) * PAGE_SIZE < this.state.count;
    }

    canPrev(): boolean {
        return this.state.page > 0;
    }

    renderController(): React.ReactNode {
        let infoBox: React.ReactNode = null;

        if (this.state.count > 0) {
            infoBox = (
                <>
                    <h1 className="my-3">
                        Pagina {this.state.page + 1}, stai vedendo {this.state.results.length}{' '}
                        risultati su {this.state.count ?? 0} totali
                    </h1>
                    <div className="is-flex is-justify-content-space-between">
                        <Button color="primary" disabled={!this.canPrev()} onClick={this.onPrev}>
                            Pagina precedente
                        </Button>
                        <Button color="primary" disabled={!this.canNext()} onClick={this.onNext}>
                            Pagina successiva
                        </Button>
                    </div>
                </>
            );
        }

        return (
            <Box className="stick-it">
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
                    <Icon align="right" className="is-clickable" onClick={this.onReset}>
                        <FontAwesomeIcon icon={faTimes} />
                    </Icon>
                </Form.Control>
                {infoBox}
            </Box>
        );
    }

    render(): React.ReactNode {
        return (
            <Container className="items-page mb-5">
                {this.renderController()}

                <ItemsRender items={this.state.results} count={this.state.count} />
            </Container>
        );
    }
}
