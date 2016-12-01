var store = require('./store');

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

    analytics: {
        simple_trend: function (data, fn) {
            fn = fn || function () { };
            var ret = [];

            data.forEach(function (d) {
                ret.push({
                    date: d.date,
                    trend: ((d.open > d.close) ? -1 : 1)
                });
            });

            fn(ret);
        }
    },

    charts: {
        studies: {
            _exponential_moving_averager: function (period) {
                var multiplier = (2 / (period + 1)),
                    ema,
                    previousDay,
                    nums = [];

                return function (num) {
                    if (typeof previousDay === 'undefined') {
                        nums.push(num);
                        if (nums.length === period) {
                            // (array sum) / period
                            previousDay = nums.reduce(function (previousValue, currentValue, currentIndex, array) {
                                return previousValue + currentValue;
                            }) / period;
                        } else {
                            return NaN;
                        }
                    } else {
                        ema = (num - previousDay) * multiplier + previousDay;
                        previousDay = ema;
                        return ema;
                    }
                };
            },
            _simple_moving_averager: function (period) {
                var nums = [];
                return function (num) {
                    nums.push(num);
                    if (nums.length > period) {
                        nums.splice(0, 1);  // remove the first element of the array
                    }
                    var sum = 0;
                    for (var i in nums) {
                        sum += nums[i];
                    }
                    var n = period;
                    if (nums.length < period) {
                        n = nums.length;
                    }
                    return (sum / n);
                };
            },
            ema: function (period, data, fn) {
                fn = fn || function () { };

                var ema = services.charts.studies._exponential_moving_averager(period),
                    d,
                    ret = [];

                for (var i = data.length - 1; i >= 0; i--) {
                    d = data[i];
                    ret.push({ date: d.date, ema: ema(d.adj_close) });
                }

                fn(ret);
            },
            macd: function (shortPeriod, longPeriod, signalPeriod, symbol, fn) {
                // TODO  
            },
            price: function (data, fn) {
                var ret = [];

                // just reverse the raw data    
                for (var i = data.length - 1; i >= 0; i--) {
                    ret.push(data[i]);
                }

                fn(ret);
            },
            sma: function (period, data, fn) {
                fn = fn || function () { };

                // setup the sma
                var sma = services.charts.studies._simple_moving_averager(period),
                    d,
                    ret = [];

                for (var i = data.length - 1; i >= 0; i--) {
                    d = data[i];
                    ret.push({ date: d.date, sma: sma(d.adj_close) });
                }

                fn(ret);
            },
            sma_bars: function (symbol, period, fn) {
                fn = fn || function () { };

                // setup the sma
                var _sma = services.charts.studies._simple_moving_averager,
                    smaO = _sma(period),
                    smaH = _sma(period),
                    smaL = _sma(period),
                    smaC = _sma(period),
                    d,
                    ret = [];

                // get the symbol data
                store.stocks.get(symbol, function (data) {
                    data = data || [];
                    for (var i = data.length - 1; i >= 0; i--) {
                        d = data[i];
                        ret.push({
                            date: d.date,
                            open: smaO(d.open),
                            high: smaH(d.high),
                            low: smaL(d.low),
                            close: smaC(d.adj_close)
                        });
                    }

                    fn(ret);
                });
            }
        },
        style: {
            chart_type: {
                heikin_ashi: function (data) {
                    var ret = [], d, retIndx, haOpen, haHigh, haLow, haClose;

                    for (var i = data.length - 1; i >= 0; i--) {
                        d = data[i];
                        retIndx = ret.length;

                        if (d.close !== d.adj_close) {
                            console.log('close mismatch: ' + (new Date(d.date)), d);
                        }

                        haClose = (d.open + d.high + d.low + d.close) / 4;
                        haOpen = retIndx > 1 ? (ret[retIndx - 1].open + ret[retIndx - 1].close) / 2 : d.open;
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
            }
        }
    },

    finviz: {
        getChart: function (symbol) {
            var img = document.createElement('img');
            img.src = ['http://finviz.com/chart.ashx?t=', symbol, '&ty=c&ta=1&p=d&s=1&zzz=', (new Date()).getTime()].join('');

            return img;
        }
    },

    hacker_news: {
        getItem: function (itemId, fn) {
            fn = fn || function () { };

            var url = ['https://hacker-news.firebaseio.com/v0/item/', itemId, '.json?print=pretty'].join('');

            if (isNaN(itemId)) {
                fn();
            } else {
                getJson(url, fn);
            }

        },
        getTopStories: function (fn) {
            getJson('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty', fn);
        }
    },

    yahoo: {
        finance: {
            callbacks: {
                historical_data: function (data, fn) {
                    var quote = data.query.results.quote,
                        symbol = quote[0].Symbol,
                        d = [];

                    quote.forEach(function (val) {
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
                    fn(d);
                },
                query: function (data) {
                    console.log(data.query.results);
                }
            },
            historical_data: function (symbol, fn) {
                var endDate = Date.today().toString('yyyy-MM-dd'),
                    startDate = Date.today().last().year().toString('yyyy-MM-dd'),
                    query = 'select * from yahoo.finance.historicaldata where symbol = "' + symbol + '" and startDate = "' + startDate + '" and endDate = "' + endDate + '"',
                    url = [
                        'http://query.yahooapis.com/v1/public/yql',
                        '?q=' + query,
                        '&format=json',
                        '&diagnostics=true',
                        '&env=store://datatables.org/alltableswithkeys',
                        '&callback=?'
                    ].join('');

                store.stocks.get(symbol, function (data) {
                    // TODO validate that the data is in the startDate endDate range
                    if (data) {
                        fn(data);
                    } else {
                        $.ajax({
                            url: url,
                            dataType: 'jsonp',
                            success: function (callbackData) {
                                services.yahoo.finance.callbacks.historical_data(callbackData, fn);
                            }
                        });
                    }
                });
            },
            query: function (symbol, fn) {
                fn = fn || function () { };

                var callback = 'services.yahoo.finance.callbacks.query',
                    url = [
                        'http://query.yahooapis.com/v1/public/yql',
                        '?q=select * from yahoo.finance.quotes where symbol="' + symbol + '"',
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


module.exports = services;
