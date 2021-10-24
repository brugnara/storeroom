import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { boundMethod } from 'autobind-decorator';
import React from 'react';
import { Box, Button, Form, Icon } from 'react-bulma-components';
import { PaginatorInfo } from '../helpers/Paginator';

export interface SearchBarProps {
    paginator: PaginatorInfo;
    onSearch: (search: string) => void;
    onSetPage: (page: number) => void;
}

export interface SearchBarState {
    query: string;
}

export class SearchBar extends React.Component<SearchBarProps, SearchBarState> {
    state: SearchBarState = {
        query: '',
    };

    @boundMethod
    onChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const query: string = event.target.value;

        this.setState({ query });

        this.props.onSearch(query.trim());
    }

    @boundMethod
    onReset(): void {
        this.setState(
            {
                query: '',
            },
            () => {
                this.props.onSearch(null);
            }
        );
    }

    canNext(): boolean {
        return (
            (this.props.paginator.currentPage + 1) * this.props.paginator.pageSize <
            this.props.paginator.total
        );
    }

    canPrev(): boolean {
        return this.props.paginator.currentPage > 0;
    }

    @boundMethod
    onNext(): void {
        this.props.onSetPage(this.props.paginator.currentPage + 1);
    }

    @boundMethod
    onPrev(): void {
        this.props.onSetPage(this.props.paginator.currentPage - 1);
    }

    renderPaginator(): React.ReactNode {
        if (this.props.paginator == null) {
            return null;
        }

        return (
            <>
                Pagina {this.props.paginator.currentPage + 1}.{' '}
                {this.props.paginator.currentPageSize ?? 0} risultati su{' '}
                {this.props.paginator.total ?? 0} mostrati.
            </>
        );
    }

    render(): React.ReactNode {
        let infoBox: React.ReactNode = null;

        if (this.props.paginator.total > 0) {
            infoBox = (
                <>
                    <h1 className="my-3">{this.renderPaginator()}</h1>
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
}
