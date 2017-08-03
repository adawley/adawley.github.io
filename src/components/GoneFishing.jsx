var React = require('react');
var _ = require('lodash');
var async = require('async');
var services = require('../services');
var store = require('../store');
var math = require('../filters').math;

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
var GoneFishing = React.createClass({

    getInitialState: function () {
        return {
            apiKey: '',
            data: {},
            updating: null,
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

    onControlClick: function (evt) {
        var self = this,
            name = evt.target.name,
            val = evt.target.value;

        if (name === 'apiUpdate') {
            if (this.state.updating) return;
            this.setState({ updating: this.state.allocations.length });
            services.alphavantage.apiKey = this.state.apiKey;
            async.map(
                this.state.allocations,

                function (alloc, callback) {
                    var symbol = alloc.symbol;
                    services.alphavantage.timeSeriesData.daily(symbol, 'compact', function (data) {
                        var sdata = self.state.data;
                        sdata[symbol] = data;
                        self.setState({ updating: self.state.updating - 1, data: sdata }, self.cacheState);
                        callback();
                    });
                },

                function done() {
                    self.setState({ updating: false });
                }
            );
        } else if (name === 'apiClear') {
            this.clearCacheState();
        }
    },

    getLatest: function (alloc, attr) {
        if (!alloc) return;

        var sdata = this.state.data[alloc.symbol];
        if (!sdata) return;

        var tsdata = sdata['Time Series (Daily)'],
            key = _.max(Object.keys(tsdata));

        switch (attr) {
            case 'close':
                return tsdata[key]['4. close'];
            case 'open':
                return tsdata[key]['1. open'];
            case 'timestamp':
                return key;
        }
    },

    getPnL: function (alloc, attr) {
        switch (attr) {
            case 'open':
                return (this.getLatest(alloc, 'close') - alloc.shareCost);
            case 'day':
                return (this.getLatest(alloc, 'close') - this.getLatest(alloc, 'open'));
        }
    },

    calcs: {
        position: {
            openPnL: function (alloc) {
                return this.getPnL(alloc, 'open') * alloc.shares;
            },
            dayPnL: function (alloc) {
                return this.getPnL(alloc, 'day') * alloc.shares;
            }

        },
        portfolio: {

        }
    },

    render: function () {
        var self = this,
            calcs = this.calcs,
            getLatest = this.getLatest,
            getPnL = this.getPnL;

        return (
            <div>
                <div className='form-inline' style={{ margin: '1em 0', }}>
                    <input type="text" className="form-control" placeholder="API Key" value={this.state.apiKey} onChange={this.onApiKeyChange} style={{ margin: '0 1em' }} />
                    <button className='btn btn-primary' onClick={this.onControlClick} name='apiUpdate' style={{ margin: '0 1em 0 0' }} disabled={this.state.updating}>Update {this.state.updating}</button>
                    <button className='btn btn-default' onClick={this.onControlClick} name='apiClear' style={{ margin: '0 1em 0 0' }}>Clear</button>
                    <span>Last Update: {_.max(_.map(this.state.allocations, function (alloc) { return getLatest(alloc, 'timestamp'); }))}</span>
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
                            <th>P/L Open</th>
                            <th>P/L Day</th>
                        </tr>
                    </thead>
                    <tbody>
                        {_.map(this.state.allocations, function (alloc) {
                            return (
                                <tr key={alloc.symbol}>
                                    <td>{alloc.symbol.toUpperCase()}</td>
                                    <td>${alloc.shareCost}</td>
                                    <td>{alloc.allocation}%</td>
                                    <td>{alloc.shares}</td>
                                    <td>${math.round(alloc.positionCost, -2)}</td>
                                    <td>{getLatest(alloc, 'close')}</td>
                                    <td>{math.round(getPnL(alloc, 'open') * alloc.shares, -2)}</td>
                                    <td>{math.round(getPnL(alloc, 'day') * alloc.shares, -2)}</td>
                                </tr>
                            );
                        })}
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>Totals:</td>
                            <td>${math.round(_.sum(_.map(this.state.allocations, function (alloc) { return alloc.positionCost; })), -2)}</td>
                            <td>${math.round(_.sum(_.map(this.state.allocations, function (alloc) { return getLatest(alloc, 'close') * alloc.shares; })), -2)}</td>
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