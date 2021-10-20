import React from 'react';
import falcor from 'falcor';
import HttpDataSource from 'falcor-http-datasource';

export abstract class BUSLayer<T = {}, S = {}> extends React.Component<T, S> {
    protected model: Readonly<falcor.Model> = new falcor.Model({
        source: new HttpDataSource('/model.json'),
    });
}
