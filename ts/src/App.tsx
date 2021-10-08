import React from 'react';

import { Layout } from './layout/Layout';

import { BrowserRouter as Router } from 'react-router-dom';

import 'bulma/css/bulma.min.css';
import ScrollToTop from './layout/ScrollToTop';
import falcor from 'falcor';
import HttpDataSource from 'falcor-http-datasource';

const model = new falcor.Model({ source: new HttpDataSource('model.json') });

interface Item {
    name: string;
    cb: string;
}

type ItemGetter = {
    item: Item;
};

model.get<ItemGetter>('item["name","cb"]').then(function (response) {
    console.log(response.json.item.name);
    console.log(response.json.item.cb);
});

export class App extends React.PureComponent {
    public render(): React.ReactNode {
        return (
            <div className="App">
                <Router>
                    <ScrollToTop />
                    <Layout />
                </Router>
            </div>
        );
    }
}

export default App;
