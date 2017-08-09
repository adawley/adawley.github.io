var React = require('react');
var _ = require('lodash');
var async = require('async');
var services = require('../services');
var store = require('../store');
var math = require('../filters').math;
var normalize = require('../filters').normalize.alphavantage.timeSeries;

function Allocation(allocation) {
    var self = this;

    this.allocation = allocation;
    this.symbol = function (symbol) { this.symbol = symbol; return this; }
    this.shares = function (shares) { this.shares = shares; doCalcs(); return this; }
    this.shareCost = function (shareCost) { this.shareCost = shareCost; doCalcs(); return this; }

    function doCalcs() {
        if (!isNaN(self.shareCost) && !isNaN(self.shares)) {
            self.positionCost = self.shares * self.shareCost;
        }
    }
}
window.normalize = normalize;
var GoneFishing = React.createClass({

    getInitialState: function () {
        return {
            apiKey: '',
            data: {},
            updating: 0,
            allocations: [
                new Allocation(15).symbol('vti').shares(3).shareCost(127.30),
                new Allocation(15).symbol('vb').shares(3).shareCost(138.44),
                new Allocation(10).symbol('vgk').shares(4).shareCost(56.76),
                new Allocation(10).symbol('vpl').shares(4).shareCost(67.55),
                new Allocation(10).symbol('vwo').shares(6).shareCost(42.99),
                new Allocation(10).symbol('hyg').shares(3).shareCost(89.04),
                new Allocation(10).symbol('bnd').shares(3).shareCost(81.98),
                new Allocation(10).symbol('tip').shares(2).shareCost(113.51),
                new Allocation(5).symbol('vnq').shares(1).shareCost(84.25),
                new Allocation(5).symbol('gdx').shares(5).shareCost(22.83)
            ]
        };
    },

    componentDidMount: function () {
        var self = this;

        store.state.get('GoneFishing', function (pState) {
            if (pState) {
                // ignore the updating flag
                pState.updating = false;
                self.setState(pState);
            }
        });
    },

    cacheState: function () {
        store.state.set('GoneFishing', this.state);
    },

    clearCacheState: function () {
        store.state.set('GoneFishing', {});
        var newState = this.getInitialState();

        // keep the api key
        newState.apiKey = this.state.apiKey;

        this.setState(newState);
    },

    onApiKeyChange: function (evt) {
        var val = evt.target.value;

        this.setState({
            apiKey: val
        }, this.cacheState);

        services.alphavantage.apiKey = val;
    },

    updateAllocationData: function (alloc, callback) {
        var self = this,
            symbol = alloc.symbol;

        async.waterfall(
            [

                function getDaily(callback) {
                    services.alphavantage.timeSeriesData.daily(symbol, 'compact', function (dailyData) {
                        callback(null, dailyData);
                    })
                },

                function getMonthly(dailyData, callback) {
                    services.alphavantage.timeSeriesData.monthly(symbol, function (monthlyData) {
                        callback(null, dailyData, monthlyData);
                    });
                },

                function getSma(dailyData, monthlyData, callback) {
                    services.alphavantage.technicalIndicators.sma(symbol, 'monthly', 12, 'close', function (smaMonthly12CloseData) {
                        callback(null, dailyData, monthlyData, smaMonthly12CloseData);
                    });
                }

            ],
            function done(err, dailyData, monthlyData, smaMonthly12CloseData) {
                var sdata = self.state.data;

                sdata[symbol] = {
                    daily: dailyData,
                    monthly: monthlyData,
                    sma_monthly_12_close: smaMonthly12CloseData
                };

                if (typeof callback === 'function') {
                    callback(sdata);
                }
            }
        );
    },

    onControlClick: function (evt) {
        var self = this,
            name = evt.target.name,
            val = evt.target.value;

        if (name === 'apiUpdate') {
            if (this.state.updating) return;

            services.alphavantage.apiKey = this.state.apiKey;

            this.setState({ updating: this.state.allocations.length });

            async.map(
                this.state.allocations,

                (alloc, callback) => {

                    self.updateAllocationData(alloc, (sdata) => {
                        self.setState({ updating: self.state.updating - 1, data: sdata }, self.cacheState);
                    });

                },

                function done() {
                    self.setState({ updating: 0 });
                }
            );
        } else if (name === 'apiClear') {
            this.clearCacheState();
        }
    },

    getLatest: function (alloc, attr) {
        if (!alloc) return;

        var data,
            key;

        try {
            if (attr.startsWith('daily_')) {
                key = attr.substring('daily_'.length);
                data = normalize(this.state.data[alloc.symbol].daily)[0];
            } else if (attr.startsWith('monthly_')) {
                key = attr.substring('monthly_'.length);
                data = normalize(this.state.data[alloc.symbol].monthly)[0];
            } else if (attr === 'smaM12C') {
                var tadata = this.state.data[alloc.symbol].sma_monthly_12_close;
                data = tadata[Object.keys(tadata)[1]];
            }
        } catch (e) {

        }

        if (!data) return;

        switch (attr) {
            case 'smaM12C':
                key = Object.keys(data)[0];

                return data[key]['SMA'];
            default:
                return data[key];
        }
    },

    getTrend: function (alloc, attr) {
        var data,
            count,
            ret = [],
            direction = 0;

        try {
            if (attr === 'fiveDay') {
                count = 5;
                data = normalize(this.state.data[alloc.symbol].daily);
            } else if (attr === 'fiveMonth') {
                count = 5;
                data = normalize(this.state.data[alloc.symbol].monthly);
            } else if (attr === 'twelveMonth') {
                count = 12;
                data = normalize(this.state.data[alloc.symbol].monthly);
            }
        } catch (e) {

        }

        if (!data) return;

        for (var i = (count - 1); i >= 0; i--) {
            var day = data[i];
            if (!day) {
                ret.push(<span key={i}>_</span>);
            } else {
                var color = (day.close > day.open) ? 'text-success' : 'text-danger';

                (day.close > day.open) ? direction++ : direction--;

                ret.push(<span className={color} key={i}>█</span>);
            }
        }
        if (direction > 0) {
            ret.push(<span className='text-success' key='direction'> {direction}</span>);
        } else if (direction < 0) {
            ret.push(<span className='text-danger' key='direction'> {Math.abs(direction)}</span>);
        } else {
            ret.push(<span className='text-warning' key='direction'> {direction}</span>);
        }

        return ret;
    },

    getPnL: function (alloc, attr) {
        if (!alloc) return;

        var data;

        try {
            data = normalize(this.state.data[alloc.symbol].daily)[0];
        } catch (e) {

        }

        if (!data) return;

        switch (attr) {
            case 'open':
                return data.close - alloc.shareCost;
            case 'day':
                return data.close - data.open;
        }
    },

    render: function () {
        var self = this,
            getLatest = this.getLatest,
            getTrend = this.getTrend,
            getPnL = this.getPnL;

        return (
            <div>
                <div className='form-inline' style={{ margin: '1em 0', }}>
                    <input type="text" className="form-control" placeholder="API Key" value={this.state.apiKey} onChange={this.onApiKeyChange} style={{ margin: '0 1em' }} />
                    <button className='btn btn-primary' onClick={this.onControlClick} name='apiUpdate' style={{ margin: '0 1em 0 0' }} disabled={this.state.updating}>{(this.state.updating) ? <span>Updating {this.state.updating}</span> : 'Update'} </button>
                    <button className='btn btn-default' onClick={this.onControlClick} name='apiClear' style={{ margin: '0 1em 0 0' }}>Clear</button>
                    <span>Last Update: {_.max(_.map(this.state.allocations, function (alloc) { return getLatest(alloc, 'daily_date'); }))}</span>
                </div>
                <table className='table table-hover table-condensed'>
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Share Cost</th>
                            <th>Allocation</th>
                            <th>Shares</th>
                            <th>Position Cost</th>
                            <th>Mark</th>
                            <th>12 Mo. SMA</th>
                            <th><div style={{textAlign:'center'}}>12 Mo. Trend </div></th>
                            <th>P/L Open</th>
                            <th>P/L Day</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {_.map(this.state.allocations, function (alloc) {
                            var close = getLatest(alloc, 'daily_close'),
                                sma = getLatest(alloc, 'smaM12C'),
                                twelveMonthTrend = getTrend(alloc, 'twelveMonth');
                            return (
                                <tr key={alloc.symbol}>
                                    <td>{alloc.symbol.toUpperCase()}</td>
                                    <td>${alloc.shareCost}</td>
                                    <td>{alloc.allocation}%</td>
                                    <td>{alloc.shares}</td>
                                    <td>${math.round(alloc.positionCost, -2)}</td>
                                    <td>{close}</td>
                                    <td className={(close > sma ? 'text-success' : 'text-danger')}>{sma}</td>
                                    <td><div style={{border:'1px solid gray',paddingLeft:'0.2em',paddingBottom:'0.1em'}}>{twelveMonthTrend}</div></td>
                                    <td>{math.round(getPnL(alloc, 'open') * alloc.shares, -2)}</td>
                                    <td>{math.round(getPnL(alloc, 'day') * alloc.shares, -2)}</td>
                                    <td><span onClick={self.updateAllocationData.bind(self, alloc)}>Refresh</span></td>
                                </tr>
                            );
                        })}
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>Totals:</td>
                            <td>${math.round(_.sum(_.map(this.state.allocations, function (alloc) { return alloc.positionCost; })), -2)}</td>
                            <td>${math.round(_.sum(_.map(this.state.allocations, function (alloc) { return getLatest(alloc, 'daily_close') * alloc.shares; })), -2)}</td>
                            <td></td>
                            <td></td>
                            <td>${math.round(_.sum(_.map(this.state.allocations, function (alloc) { return getPnL(alloc, 'open') * alloc.shares; })), -2)}</td>
                            <td>${math.round(_.sum(_.map(this.state.allocations, function (alloc) { return getPnL(alloc, 'day') * alloc.shares; })), -2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

});

module.exports = GoneFishing;