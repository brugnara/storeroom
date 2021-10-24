import React from 'react';
import { Container } from 'react-bulma-components';
import { Item } from '../../common/Types';
import { ItemCard } from './ItemCard';

export function ItemsRender(props: { items: Array<Item>; count: number }): JSX.Element {
    if (!props.items?.length) {
        return null;
    }

    const cards = props.items.map((result, i) => {
        return <ItemCard key={i} {...result} />;
    });

    return <Container className="items-render">{cards}</Container>;
}
