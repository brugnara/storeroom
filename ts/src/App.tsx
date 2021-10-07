import React from 'react';

import {Layout} from './layout/Layout';

import {
    BrowserRouter as Router,
} from 'react-router-dom';

import 'bulma/css/bulma.min.css';
import ScrollToTop from './layout/ScrollToTop';
import falcor from 'falcor';
import HttpDataSource from 'falcor-http-datasource';

interface AppProps {
    foo?: string;
}

const model = new falcor.Model({source: new HttpDataSource('items.json') });

export class App extends React.PureComponent<AppProps> {
    constructor(props: AppProps) {
        super(props);


        // retrieve the "greeting" key from the root of the Virtual JSON resource
        model.
            get('greeting').
            then(function(response) {
                console.log(response.json.greeting);
            });
    }

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
