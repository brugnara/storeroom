import falcor from 'falcor';
import HttpDataSource from 'falcor-http-datasource';

const model = new falcor.Model({ source: new HttpDataSource('model.json') });

// model.get('itemByCB["8000036016251"]["name"]').then(console.log);
// model.get(['itemByID', '25q7BJRKM4a4Cu84i', ['name', 'cb'], 'name']).then(console.log);

// model.get<ItemGetter>(['item', ['name', 'cb'], 'name']).subscribe(console.log);
// model.get<ItemGetter>(['items', { from: 1, to: 2}, ['name', 'cb']]).then(console.log);
// model.get<ItemGetter>('items[0..20]["name","productor","cb"]').then(console.log);
// model.get<ItemGetter>('itemsFind["pasta"][0..10]["name","cb"]').then(console.log);
/*
model.get<ItemGetter>(
    [
        'itemsFind',
        ['name', 'productor'],
        ['pasta'],
        ['name', 'productor'],
        ['name', 'productor'],
    ]).subscribe(console.log);

    model.get('itemsFind["name","productor"]["pasta"][0..10]').then((response) => {
        console.log(JSON.stringify(response.json.itemsFind.name, null, 2));
    });
    */

export default model;
