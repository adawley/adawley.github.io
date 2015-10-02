window.filters = {
    url: {
        hostname: function(url) {
            return !url ? '' : _(url.split('/')).filter().value()[1];
        }
    }
};
