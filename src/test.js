(function (store, services, filters, components, _, $) {
    'use strict';

    var ctest = {
        yahoo_finance: {
            run: function () {
                var symbol = $('#yahoo_finance-charting-symbol').val();
                services.yahoo.finance.historical_data(symbol, function () {
                    ctest.yahoo_finance.chart.sma_bars(symbol, 5);
                });
            },
            chart: {
                ha: function (symbol) {
                    components.yahoo_finance.chart.ha(symbol, function (data) {
                        components.yahoo_finance.chart.plot('chartdiv', data.splice(data.length - 40, data.length));
                    });
                },
                sma_bars: function (symbol, period) {
                    components.yahoo_finance.chart.sma_bars(symbol, period, function (data) {
                        components.yahoo_finance.chart.plot('chartdiv', data.splice(data.length - 40, data.length));
                    });
                },
                trend: function (symbol) {
                    components.yahoo_finance.chart.trend(symbol, function (data) {
                        data.forEach(function (val) {
                            console.log(new Date(val.date) + ': ' + val.trend);
                        });
                    });
                }
            }
        }
    };

    window.ctest = ctest;

} (window.store, window.services, window.filters, window.components, window._, window.$));
