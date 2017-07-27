var React = require('react');
var FinvizCharts = require('./FinvizCharts.jsx');
var HackerNewsTopStories = require('./HackerNewsTopStories.jsx');
var YahooCharts = require('./YahooCharts.jsx');
var GoneFishing = require('./GoneFishing.jsx');
var App = React.createClass({

    getInitialState: function () {
        return {
            route: ''
        };
    },

    trigger: function (destination) {
        this.setState({ route: destination });
    },

    render: function () {
        var route = this.state.route;

        return (
            <div>
                <nav className="navbar navbar-full navbar-dark navbar-static-top bg-inverse">
                    <button type="button" className="navbar-toggler hidden-sm-up" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar" aria-label="Toggle navigation"></button>
                    <a className="navbar-brand" href="#" onClick={this.trigger.bind(null, '')}>Sugar</a>
                    <div id="navbar">
                        <nav className="nav navbar-nav float-xs-left">
                            <a className="nav-item nav-link" href="#" onClick={this.trigger.bind(null, 'FinvizCharts')}>Finance</a>
                            <a className="nav-item nav-link" href="#" onClick={this.trigger.bind(null, 'HackerNewsTopStories')}>Stories</a>
                            <a className="nav-item nav-link" href="#" onClick={this.trigger.bind(null, 'YahooCharts')}>Charts</a>
                            <a className="nav-item nav-link" href="#" onClick={this.trigger.bind(null, 'GoneFishing')}>Fishing</a>
                            <a className="nav-item nav-link" href="#">Help</a>
                        </nav>
                        <form className="float-xs-right">
                            <input type="text" className="form-control" placeholder="Search..." />
                        </form>
                    </div>
                </nav>
                <div className="container-fluid">
                    <div className="row">
                        {route == 'FinvizCharts' && <FinvizCharts />}
                        {route == 'HackerNewsTopStories' && <HackerNewsTopStories />}
                        {route == 'YahooCharts' && <YahooCharts />}
                        {route == 'GoneFishing' && <GoneFishing />}
                    </div>
                </div>
            </div>
        );
    }

});

module.exports = App;