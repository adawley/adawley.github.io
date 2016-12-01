var _ = require('lodash');
var filters = {
    url: {
        hostname: function(url) {
            return !url ? '' : _(url.split('/')).filter().value()[1];
        }
    }
};

module.exports = filters;
