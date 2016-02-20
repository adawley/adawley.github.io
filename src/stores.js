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
            Struct: function(){
                this.adj_close = 0.0;
                this.date = new Date();
                this.open = 0.0;
                this.high = 0.0;
                this.low = 0.0;
                this.close  = 0.0;
                this.volume = 0;
            },
            save: function(symbol, data, fn){
                store.stocks._db.save({
                    key: symbol,
                    val: data
                }, fn);
            },
            get: function(symbol, fn){
                fn = fn || function(){};
                store.stocks._db.get(symbol, function(data){
                    // just send back the array of data instead of the obj
                    fn(data.val);
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
