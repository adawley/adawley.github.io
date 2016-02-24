(function($, store) {
    'use strict';

    function getJson(url, fn) {
        var httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function handleStateChange() {
            if (httpRequest.readyState === 4) {
                if (httpRequest.status === 200) {
                    fn(JSON.parse(httpRequest.responseText));
                } else {
                    alert('There was a problem with the request.');
                }
            }
        };

        httpRequest.open('GET', url);
        httpRequest.send();
    }

    var services = {

        analytics:{
            simple_trend: function(data, fn){
                fn = fn || function(){};
                var ret = [];

                data.forEach(function(d){
                    ret.push({
                        date: d.date,
                        trend: ((d.open > d.close) ? -1 : 1)
                    });
                });

                fn(ret);
            }
        },

        charting:{
            candlesticks: function(data){
                var ret = [], d, retIndx, haOpen, haHigh, haLow, haClose;

                for (var i = data.length - 1; i >= 0; i--) {
                    d = data[i];
                    retIndx = ret.length;

                    if(d.close !== d.adj_close){
                        console.log('close mismatch: '+(new Date(d.date)),d);
                    }

                    haClose = (d.open + d.high + d.low + d.close) / 4;
                    haOpen = retIndx > 1 ? (ret[retIndx-1].open + ret[retIndx-1].close) / 2 : d.open;
                    haHigh = Math.max(d.high, haOpen, haClose);
                    haLow = Math.min(d.low, haOpen, haClose);

                    ret.push({
                        close: haClose,
                        high: haHigh,
                        low: haLow,
                        open: haOpen,
                        date: d.date
                    });
                }

                return ret;
            }
        },

        finviz: {
            getChart: function(symbol) {
                var img = document.createElement('img');
                img.src = ['http://finviz.com/chart.ashx?t=', symbol, '&ty=c&ta=1&p=d&s=1&zzz=', (new Date()).getTime()].join('');

                return img;
            }
        },

        hacker_news: {
            getItem: function(itemId, fn) {
                fn = fn || function() {};

                var url = ['https://hacker-news.firebaseio.com/v0/item/', itemId, '.json?print=pretty'].join('');

                if (isNaN(itemId)) {
                    fn();
                } else {
                    getJson(url, fn);
                }

            },
            getTopStories: function(fn) {
                getJson('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty', fn);
            }
        },

        yahoo: {
            finance: {
                callbacks:{
                    historical_data: function(data){
                        var quote = data.query.results.quote,
                            symbol = quote[0].Symbol,
                            d = [];

                        quote.forEach(function(val){
                            d.push({
                                adj_close: parseFloat(val.Adj_Close),
                                close: parseFloat(val.Close),
                                date: new Date(val.Date + ' 12:00:00').getTime(),
                                high: parseFloat(val.High),
                                low: parseFloat(val.Low),
                                open: parseFloat(val.Open),
                                volume: parseInt(val.Volume)
                            });
                        });

                        store.stocks.save(symbol, d);
                        console.log('yahoo.finance.callbacks.historical_data: save complete');
                    },
                    query: function(data){
                        console.log(data.query.results);
                    }
                },
                historical_data: function(symbol){
                    var endDate = Date.today().toString('yyyy-MM-dd'),
                        startDate = Date.today().last().year().toString('yyyy-MM-dd'),
                        callback = 'services.yahoo.finance.callbacks.historical_data',
                        query = 'select * from yahoo.finance.historicaldata where symbol = "'+symbol+'" and startDate = "'+startDate+'" and endDate = "'+endDate+'"',
                        url = [
                            'http://query.yahooapis.com/v1/public/yql',
                            '?q='+query,
                            '&format=json',
                            '&diagnostics=true',
                            '&env=store://datatables.org/alltableswithkeys',
                            '&callback=' + callback
                        ].join('');

                    $.ajax({
                        url: url,
                        dataType: 'jsonp',
                        jsonp: 'callback',
                        jsonpCallback: callback
                    });
                },
                query: function(symbol, fn) {
                    fn = fn || function() {};

                    var callback = 'services.yahoo.finance.callbacks.query',
                        url = [
                            'http://query.yahooapis.com/v1/public/yql',
                            '?q=select * from yahoo.finance.quotes where symbol="'+symbol+'"',
                            '&format=json',
                            '&diagnostics=true',
                            '&env=store://datatables.org/alltableswithkeys',
                            '&callback=' + callback
                        ].join('');

                    $.ajax({
                        url: url,
                        dataType: 'jsonp',
                        jsonp: 'callback',
                        jsonpCallback: callback
                    });
                }
            }
        }

    };

    window.services = services;

}(window.jQuery, window.store));
