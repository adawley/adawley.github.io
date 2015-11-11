(function(services, filters, _, $) {
    'use strict';
    var components = {

        finviz: {
            charts: function(el) {
                var symbols = ['spy', 'dia', 'fb', 'vglt'],
                    fv = services.finviz,
                    symbolBox;

                if (el.children().length > 0) {
                    symbolBox = $(el.children().first())[0];
                    symbols = symbolBox.value.split(',');
                } else {
                    symbolBox = $('<input>').css('display','block');
                    symbolBox.val(symbols.join());
                }
                el.text(' ');
                el.append(symbolBox);

                _.each(symbols, function(symbol) {
                    el.append(fv.getChart(symbol));
                });

            }
        },

        hacker_news: {
            topStories: function(el) {
                var hn = services.hacker_news;

                var makeLink = function(article) {

                    var url = filters.url.hostname(article.url),
                        pel = document.createElement('p');

                    $(pel)
                        .addClass('article')
                        .append('<a href="' + article.url + '" target="_blank" class="article-title">' + article.title + '</a>')
                        .append('<br/><span class="article-url">(' + url + ') | <a href="https://news.ycombinator.com/item?id=' + article.id + '" target="_blank">' + article.descendants + ' comments</a></span>');

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

    window.components = components;
}(window.services, window.filters, window._, window.$));
