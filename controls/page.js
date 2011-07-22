var control = require('controljs').control;
var merge = require('controljs').utils.merge;

var page = function(config){
	merge( this, config || {});
	var headerItems = [];
	if(this.title){
		headerItems.push({
			tag: 'title',				
			controlValue: this.title
		});
	}
	if(this.viewport){
		headerItems.push({
			tag: 'meta',
			voidElement: true,
			attributes: {
				name: 'viewport',
				content: 'width = device-width'
			}
		});
	}
	if(this.stylesheets && this.stylesheets.length){
		this.stylesheets.forEach(function(stylesheet){
			headerItems.push({
				tag: 'link',
				voidElement: true,
				attributes: {
					rel: 'stylesheet',
					href: stylesheet
				}
			});
		});
	}
	if(this.scripts && this.scripts.length){
		this.scripts.forEach(function(script){
			if(script.src){
				headerItems.push({
					tag: 'script',
					attributes: {
						type: script.type || "text/javascript",
						src: script.src
					}
				});
			}
			else if(script.controlValue){
				headerItems.push(merge(script ,{tag: 'script'}));
			}
			else{
				headerItems.push({
					tag: 'script',
					controlValue: script
				});
			}
		});
	}
	var bodyItems = this.body || [];
//	if(config.controlValue){
//		bodyItems.push(config.controlValue);
//	}
	merge(this,{
		tag 	: 'html',
		isRootControl: true,
		items	: [{
			tag: 'head',
			name: 'head',
			items: headerItems
		},{
			tag: 'body',
			name: 'body',
			attributes: this.bodyAttributes,
			items: bodyItems,
			controlValue: this.controlValue
		}]
	});
	control.call(this);
};

page.inheritsFrom(control);

exports = module.exports = {
	page : page
};