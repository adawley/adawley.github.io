var React = require('react');
var _ = require('lodash');
var services = require('../services');
var filters = require('../filters');
var HackerNewsTopStories = React.createClass({

    getInitialState: function () {
        return {
            topStories: [],
            topStoriesItems: []
        };
    },

    componentDidMount: function () {
        var self = this;
        services.hacker_news.getTopStories(function (topStories) {
            for (var i = 0; i < 25; i++) {
                services.hacker_news.getItem(topStories[i], function (item) {
                    var topStoriesItems = self.state.topStoriesItems;
                    topStoriesItems.splice(self.state.topStories.indexOf(item.id), 0, item);
                    self.setState({
                        topStories: topStories,
                        topStoriesItems: topStoriesItems
                    });
                });
            }
        });
    },

    render: function () {

        return (
            <div className='container'>
                {_.map(this.state.topStoriesItems, function (article) {
                    var url = filters.url.hostname(article.url);
                    return (
                        <div key={article.id} style={{ marginTop: '0.5em' }}>
                            <a href={article.url} target="_blank" style={{ fontFamily: 'monospace', lineHeight: '0.8em' }} className='d-block'>{article.title}</a>

                            <small style={{ lineHeight: '0.3em' }}>({url}) | <a href={"https://news.ycombinator.com/item?id=" + article.id} target="_blank">{article.descendants}comments</a></small>
                        </div>
                    );
                })}
            </div>
        );
    }

});

module.exports = HackerNewsTopStories;