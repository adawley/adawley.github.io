var filters = {
	url: {
		hostname: function(url){
			return _(url.split('/')).filter().value()[1];
		}
	}
};
