var React = require('react');
var _ = require('lodash');
var services = require('../services');
var filters = require('../filters');
var GoneFishing = React.createClass({

    getInitialState: function () {
        return {
            data: {}
        };
    },

    componentDidMount: function () {
        var self = this;

    },

    onApiKeyChange: function (evt) {
        services.alphavantage.apiKey = evt.target.value;
        this.forceUpdate();
    },

    updateData: function () {
        services.alphavantage.timeSeriesData.daily('dia', '', function (data) {
            console.log(data);
        });
    },

    render: function () {

        return (
            <div>
                <div className='col-xs-12'>
                    <input type="text" className="form-control" placeholder="API Key" value={services.alphavantage.apiKey} onChange={this.onApiKeyChange} />
                    <button onClick={this.updateData}>Go</button>
                </div>

            </div>
        );
    }

});

module.exports = GoneFishing;