import React from 'react';
import { Card, Columns, Content, Heading, Media } from 'react-bulma-components';
import { Item } from '../../common/Types';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode } from '@fortawesome/free-solid-svg-icons';

export class ItemCard extends React.Component<Item> {
    get submitted(): string {
        return format(new Date(this.props.submitted), 'dd/MM/yyyy');
    }

    renderMoreInfo(): React.ReactNode {
        return null;

        return (
            <>
                <div>
                    il <time dateTime={this.submitted}>{this.submitted}</time>
                </div>
                <div>{this.props.votes?.voteCount ?? 0} voti</div>
            </>
        );
    }

    renderCB(): React.ReactNode {
        if (isNaN(+this.props.cb)) {
            return null;
        }

        return (
            <span>
                <FontAwesomeIcon icon={faBarcode} className="mr-2" />
                {this.props.cb}
            </span>
        );
    }

    render(): React.ReactNode {
        return (
            <Card className="mb-2">
                <Card.Content>
                    <Content>
                        <Columns>
                            <Columns.Column size={8}>
                                <Media>
                                    <Media.Item>
                                        <Heading size={4}>{this.props.name}</Heading>
                                        <Heading subtitle size={6}>
                                            {this.props.productor}
                                        </Heading>
                                        {this.renderCB()}
                                    </Media.Item>
                                </Media>
                            </Columns.Column>
                            <Columns.Column className="has-text-right">comandi</Columns.Column>
                        </Columns>
                    </Content>
                </Card.Content>
            </Card>
        );
    }
}
