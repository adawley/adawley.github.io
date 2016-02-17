(function(Lawnchair){
    'use strict';

    var store = {
        stocks: new Lawnchair({adapter: 'dom', name: 'stocks', record: 'stock'}, function(){})
    };

    window.store = store;
}(window.Lawnchair));
