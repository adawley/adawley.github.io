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
                img.src = ['http://finviz.com/chart.ashx?t=', symbol, '&ty=c&ta=1&p=d&s=1&zzz=',(new Date()).getTime()].join('');

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
        }
    };

    window.services = services;
}());
