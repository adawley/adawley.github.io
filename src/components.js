(function(store, services, filters, _, $) {
    'use strict';
    var components = {

        finviz: {
            charts: function(el) {
                var symbols = ['spy', 'dia', 'fb', 'vglt'],
                    fv = services.finviz,
                    symbolBox;

                if (el.children().length > 0) {
                    symbolBox = $(el.children().first())[0];
                    symbols = symbolBox.value.split(',');
                } else {
                    symbolBox = $('<input>').css('display','block');
                    symbolBox.val(symbols.join());
                }
                el.text(' ');
                el.append(symbolBox);

                _.each(symbols, function(symbol) {
                    el.append(fv.getChart(symbol));
                });

            }
        },

        hacker_news: {
            topStories: function(el) {
                var hn = services.hacker_news;

                var makeLink = function(article) {

                    var url = filters.url.hostname(article.url),
                        pel = document.createElement('p');

                    $(pel)
                        .addClass('article')
                        .append('<a href="' + article.url + '" target="_blank" class="article-title">' + article.title + '</a>')
                        .append('<br/><span class="article-url">(' + url + ') | <a href="https://news.ycombinator.com/item?id=' + article.id + '" target="_blank">' + article.descendants + ' comments</a></span>');

                    el.append(pel);
                };

                el.text(' ');

                hn.getTopStories(function(data) {

                    for (var i = 0; i < 25; i++) {

                        hn.getItem(data[i], makeLink);
                    }
                });
            }
        },

        yahoo_finance: {

            chart: {

                ha: function(symbol, fn){
                    fn = fn || function(){};

                    store.stocks.get(symbol, function(data){
                        fn(services.charting.candlesticks(data));
                    });
                },

                trend: function(symbol, fn){
                    fn = fn || function(){};

                    components.yahoo_finance.chart.ha(symbol, function(data){
                        services.analytics.simple_trend(data, fn);
                    });
                }

            },

            historical_data: function(symbol){
                var yf = services.yahoo.finance;

                yf.query(symbol, function(data){
                    console.log('historical_data: '+data);
                });
            },

            test: {
                trend: function(){
                    components.yahoo_finance.chart.trend('spy', function(data){
                        data.forEach(function(val){
                            console.log(new Date(val.date)+': '+val.trend);
                        });
                    });
                }
            }
        }

    };

    window.components = components;

}(window.store, window.services, window.filters, window._, window.$));
