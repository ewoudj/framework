//var control = require('./control').control;
//var merge = require('./control').utils.merge;
//var form = require('./form').form;
//var list = require('./list').list;
//
///*
// * Text control
// */
//var referenceListContol = function(config){
//	if(config && config.value && config.value.query){
//		config.query = config.value.query;
//	}
//	list.call(this, config);
//};
//referenceListContol.inheritsFrom(list);
//
//control.registry['referenceListContol'] = referenceListContol;
//
//form.registerControl('view', 'referencelist', referenceListContol);
//
//exports = module.exports = {
//	control: referenceListContol
//};