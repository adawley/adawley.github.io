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

        charting:{
            candlesticks: function(d){
                var Close = (d.Open + d.High + d.Low + d.Close) / 4,
                    High = Math.max(d.High, d.Open, d.Close),
                    Low = Math.min(d.Low, d.Open, d.Close),
                    Open = (d[-1].Open + d[-1].Close) / 2;

                return [Open, High, Low, Close];
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
                        console.log(data);
                        console.log(data.query.results);
                        var results = data.query.results;

                        store.stocks.save(results.quote);
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
