var services = {

	finviz: {
		getChart: function(symbol){
			var img = document.createElement('img');
			img.src = "http://finviz.com/chart.ashx?t="+symbol+"&ty=c&ta=1&p=d&s=1";

			return img;
		}
	},

	hacker_news: {
		getItem: function(itemId, fn){
			fn = fn || function(){};

			if(isNaN(itemId)){
				fn();
			} else {
				$.getJSON('https://hacker-news.firebaseio.com/v0/item/' + itemId + '.json?print=pretty', fn);
			}

		},
		getTopStories: function(fn){
			$.getJSON('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty', fn);
		}
	}
};
