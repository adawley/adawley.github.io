(function(Lawnchair){
    'use strict';

    var store = {
        stocks: {
            _db: new Lawnchair({adapter: 'dom', name: 'stocks', record: 'stock'}, function(){}),
            _index: {},
            init: function(){
                store.stocks._db.all(function(data){
                    console.log(data);
                });
            },
            save: function(data){

                store.stocks._db.save({
                    key: data[0].Symbol,
                    val: data
                });
            }
        }
    };

    Object.keys(store).forEach(function(val){
        if(typeof val.init === 'function'){
            val.init();
        }
    });

    window.store = store;
}(window.Lawnchair));
