var control = require('./control').control;
var merge = require('./control').utils.merge;
var form = require('./form').form;
var rest = require('./../net/rest').utils;

var topbar = function(config){
	merge(this,{
		tag: 'header',
		items: [{
			attributes: {
				cls: 'linkbar'
			},
			items:[{
				tag: 'a',
				name: 'signInButton',
				controlValue: config.user ? 'Sign out ' + config.user.userName : 'Sign In',
				attributes: {
					cls: 'topbarlink',
					href: config.user ? rest.toUrl({view:'logout'}) : rest.toUrl({view:'form',mode:'edit',model:'login'}) 
				}
			}]
		},{
			tag: 'a',
			attributes: {
				href: '/',
				cls:'smallTitle'
			},
			controlValue: config.title || 'untitled'
		},{
			tag: 'input',
			name: 'searchInput',
			attributes: {					
				placeholder: 'Find a topic...',
				cls: 'searchInput'
			}
		},{
			tag: 'a',
			name: 'searchButton',
			controlValue: 'Search',
			attributes:{
				cls: 'button'
			},
			events: {
				onclick: function(ctl, evt){
					window.location.href = rest.toUrl({
						view: 'search' , 
						query: this.parentControl.searchInput.element.value
					}); // "index.html?view=search&query=" + this.parentControl.searchInput.element.value ;
				}
			}
		},{
			tag: 'a',
			name: 'createTopicButton',
			controlValue: 'Create Topic',
			attributes:{
				cls: 'button'
			},
			events: {
				onclick: function(ctl, evt){
					window.location.href = rest.toUrl({
						view: 'form',
						mode: 'edit',
						model: 'topic'
					}); // "index.html?view=form&mode=new&model=topic";
				}
			}
		}]
	});
	merge(this, config);
	control.call(this);
};

topbar.inheritsFrom(control);

topbar.prototype.bind = function(rootElement){
	this.baseClass.bind.call(this, rootElement);
	this.currentTopic = '';
	setInterval(function(){
		var inputElement = this.searchInput.element;
		var value = inputElement.value.trim();
		if(value != this.currentTopic){
			this.currentTopic = value;
			document.title = (this.title || 'Untitled') + (this.currentTopic ? ': ' : '') + this.currentTopic;
			this.fire('search',{query: this.currentTopic});
		}
	}.scope(this),200);
};

control.registry['topbar'] = topbar;

exports = module.exports = {
	topbar : topbar
};