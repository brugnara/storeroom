import { boundMethod } from 'autobind-decorator';
import React from 'react';

import { Container } from 'react-bulma-components';

import { Item, FindGetter, CountableResult } from '../../common/Types';
import store from '../Store';
import { ISearchAction } from '../reducers/SearchReducer';

import './ItemsPage.less';
import { keyValuedResultsToArray } from '../../common/Helpers';

import { debounce } from 'debounce';
import { BUSLayer } from '../helpers/BUSLayer';
import { ItemsRender } from '../components/ItemsRender';
import FalcorJsonGraph from 'falcor-json-graph';
import { SearchBar, SearchBarProps } from '../components/SearchBar';
import { PaginatorInfo } from '../helpers/Paginator';

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
    onChange(query: string): void {
        if (query == null) {
            return this.onReset();
        }

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

    get paginator(): PaginatorInfo {
        return {
            currentPage: this.state.page,
            pageSize: PAGE_SIZE,
            total: this.state.count,
            currentPageSize: this.state.results.length,
        };
    }

    render(): React.ReactNode {
        const props: SearchBarProps = {
            paginator: this.paginator,
            onSearch: this.onChange,
            onSetPage: (page: number) => this.setState({ page }),
        };

        return (
            <Container className="items-page mb-5">
                <SearchBar {...props} />

                <ItemsRender items={this.state.results} count={this.state.count} />
            </Container>
        );
    }
}
