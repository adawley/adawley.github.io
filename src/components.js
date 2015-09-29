var components = {

    finviz: {
        charts: function(el) {
            var symbols = ['spy', 'fb', 'vglt'],
                fv = services.finviz;

            el.text(' ');

            _.each(symbols, function(symbol) {
                el.append(fv.getChart(symbol));
            });

        }
    },

    hacker_news: {
        topStories: function(el) {
            var hn = services.hacker_news;

            var makeLink = function(article) {
                console.log(article);

                var url = filters.url.hostname(article.url),
                    pel = document.createElement('p');

                $(pel)
                  .addClass('article')
                  .append('<a href="' + article.url + '" target="_blank" class="article-title">' + article.title + '</a>')
                  .append('<br/><span class="article-url">(' + url + ') | <a href="https://news.ycombinator.com/item?id='+article.id+'" target="_blank">'+article.descendants+' comments</a></span>');

                el.append(pel);
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
