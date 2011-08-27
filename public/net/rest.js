var configuration = {
	baseUrl: 'index.html'	
};

/*
 * Very simplistic utility function that turns an object into an arguments string
 * and prefixes it with a configurable 'base url'
 * This function does not recurse into referenced objects.
 */
var toUrl = function(o){
	var result = '';
	for(var s in o){
		if(result !== ''){
			result = result + '&';
		}
		result = result + (s + '=' + o[s]); 
	}
	return configuration.baseUrl + '?' + result;
};

exports = module.exports = {
	configuration: configuration,
	utils: {
		toUrl: toUrl
	}
};

