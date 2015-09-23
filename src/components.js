var components = {

    finviz: {
        charts: function() {
            var symbols = ['spy', 'fb'],
                fv = services.finviz,
                el = $('#finviz');

            el.text(' ');

            _.each(symbols, function(symbol) {
                el.append(fv.getChart(symbol))
                    .append(document.createElement('br'));
            });

        }
    },

    hacker_news: {
        topStories: function() {
            var hn = services.hacker_news,
                el = $('#hacker_news');

            var makeLink = function(article) {
                console.log(article);
                var url = filters.url.hostname(article.url);

                el.append('<p>')
                  .append('<a href="' + article.url + '" target="_blank" class="article-title">' + article.title + '</a>')
                  .append('<br/><span class="article-url">(' + url + ')</span></p>');
            };

            el.text(' ');

            hn.getTopStories(function(data) {

                for (var i = 0; i < 25; i++) {

                    hn.getItem(data[i], makeLink);
                }
            });
        }
    }
};