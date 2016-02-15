(function() {
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
                historical_data: function(symbol){
                    var endDate = Date.today(),
                        startDate = Date(new Date().setDate(new Date().getDate()-5)),
                        query = 'select * from yahoo.finance.historicaldata where symbol = "'+symbol+'" and startDate = "2009-09-11" and endDate = "2010-03-10"',
                        url = [
                            'http://query.yahooapis.com/v1/public/yql',
                            '?q='+query,
                            '&format=json',
                            '&diagnostics=true',
                            '&env=store://datatables.org/alltableswithkeys',
                            '&callback=services.yahoo.finance.quote'
                        ].join('');

                        $.ajax({
                            url: url,
                            dataType: 'jsonp',
                            jsonp: 'callback',
                            jsonpCallback: 'services.yahoo.finance.quote'
                        });
                },
                query: function(symbol, fn) {
                    fn = fn || function() {};
                    var quote = fn;

                    var url = [
                        'http://query.yahooapis.com/v1/public/yql',
                        '?q=select * from yahoo.finance.quotes where symbol="'+symbol+'"',
                        '&format=json',
                        '&diagnostics=true',
                        '&env=store://datatables.org/alltableswithkeys',
                        '&callback=services.yahoo.finance.quote'
                    ].join('');

                    $.ajax({
                        url: url,
                        dataType: 'jsonp',
                        jsonp: 'callback',
                        jsonpCallback: 'services.yahoo.finance.quote'
                    });
                },
                quote: function(data) {
                    console.log(data.query.results);
                }
            }
        }

    };

    window.services = services;
}());
