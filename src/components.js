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

            charting: function(el){
                var symbolBox = el.find('#symbol');

                symbolBox.css('display','block');
                symbolBox.val('spy');
            },

            chart: {



                plot: function(divId, data){
                    var options = {},
                        ohlc = [],
                        ticks = [],
                        sma = [],
                        sma5 = components.yahoo_finance.chart._simple_moving_averager(5),
                        d, i, date;

                    if(typeof divId === 'string'){
                        options.divId = divId;
                        options.title = 'Chart';
                    }

                    console.log(data);

                    for (i = 0; i < data.length; i++) {
                        d = data[i];

                        if(i%5 === 0){
                            date = (new Date(d.date)).toString('MM/dd/yyyy');
                        } else {
                            date = '';
                        }

                        ticks.push(date);

                        ohlc.push([i, d.open, d.high, d.low, d.close]);
                        sma.push([i,sma5(d.close)]);
                    }

                    $.jqplot(options.divId,[ohlc, sma],{
                        title: options.title,
                        axesDefaults:{},
                        axes: {
                            xaxis: {
                                renderer:$.jqplot.CategoryAxisRenderer,
                                ticks:ticks
                            },
                            yaxis: {
                                tickOptions:{ prefix: '$' }
                            }
                        },
                        series: [{renderer:$.jqplot.OHLCRenderer, rendererOptions:{candleStick:true}}],
                        cursor:{
                            show:true,
                            zoom:true,
                            tooltipOffset: 10,
                            tooltipLocation: 'nw'
                        },
                        highlighter: {
                            show:true,
                            showMarker:false,
                            tooltipAxes: 'xy',
                            yvalues: 4,
                            formatString:'<table class="jqplot-highlighter"> \
                            <tr><td>date:</td><td>%s</td></tr> \
                            <tr><td>open:</td><td>%s</td></tr> \
                            <tr><td>hi:</td><td>%s</td></tr> \
                            <tr><td>low:</td><td>%s</td></tr> \
                            <tr><td>close:</td><td>%s</td></tr></table>'
                        }
                    });
                },

                ha: function(symbol, fn){
                    fn = fn || function(){};

                    store.stocks.get(symbol, function(data){
                        fn(services.charts.style.chart_type.heikin_ashi(data));
                    });
                },

                sma: function(symbol, period, fn){
                    fn = fn || function(){};

                    // get the symbol data
                    store.stocks.get(symbol, function(data){
                        services.charts.studies.sma(period, data, fn);
                    });

                },

                sma_bars: function(symbol, period, fn){
                    fn = fn || function(){};

                    // get the symbol data
                    store.stocks.get(symbol, function(data){
                        services.charts.studies.sma_bars(period, data, fn);
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
            }
        }

    };

    window.components = components;

}(window.store, window.services, window.filters, window._, window.$));
