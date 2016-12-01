var React = require('react');
var _ = require('lodash');
var FinvizCharts = React.createClass({

    getInitialState: function () {
        var defaultSymbols = ['spy', 'dia', 'fb', 'vglt'];
        return {
            symbols: defaultSymbols,
            symbolsInput: defaultSymbols.join(',')
        };
    },

    _onChangeTimeout: null,
    onChange: function (e) {
        var val = e.target.value,
            self = this;

        if (this._onChangeTimeout) {
            clearTimeout(this._onChangeTimeout);
        }

        this.setState({ symbolsInput: val });

        this._onChangeTimeout = setTimeout(function () {
            self.setState({ symbols: val.split(',') });
        }, 500);
    },

    render: function () {

        return (
            <div>
                <input className='form-control' value={this.state.symbolsInput} onChange={this.onChange} />
                {_(this.state.symbols)
                    .filter()
                    .map(function (symbol, index) {
                        symbol = symbol.trim();
                        var src = ['http://finviz.com/chart.ashx?t=', symbol, '&ty=c&ta=1&p=d&s=1'].join(''),
                            dynSrc = [src, '&zzz=', (new Date()).getTime()].join('');
                        return <img src={src} key={index} />;
                    })
                    .value()
                }
            </div>
        );
    }

});

module.exports = FinvizCharts;