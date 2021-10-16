import React from 'react';
import { Card, Columns, Content, Heading, Media } from 'react-bulma-components';
import { Item } from '../../common/Types';
import { format } from 'date-fns';
import { UserMiniBox } from './UserMiniBox';

export class ItemCard extends React.Component<Item> {
    get submitted(): string {
        return format(new Date(this.props.submitted), 'dd/MM/yyyy');
    }

    render(): React.ReactNode {
        return (
            <Card>
                <Card.Content>
                    <Content>
                        <Columns>
                            <Columns.Column size={8}>
                                <Media>
                                    <Media.Item>
                                        <Heading size={4}>
                                            {this.props.name}
                                        </Heading>
                                        <Heading subtitle size={6}>
                                            {this.props.productor}
                                        </Heading>
                                    </Media.Item>
                                </Media>
                            </Columns.Column>
                            <Columns.Column className="has-text-right">
                                <div>
                                    <a href="#">{this.props.cb}</a>
                                </div>
                                <UserMiniBox
                                    {...this.props.createdBy}
                                    prepend={'Inserito da'}
                                />
                                <div>
                                    il{' '}
                                    <time dateTime={this.submitted}>
                                        {this.submitted}
                                    </time>
                                </div>
                            </Columns.Column>
                        </Columns>
                    </Content>
                </Card.Content>
            </Card>
        );
    }
}
