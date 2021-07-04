import React from 'react';

import './App.css';
import {Layout} from './layout/Layout';

import {
    BrowserRouter as Router,
} from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import ScrollToTop from './layout/ScrollToTop';

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
