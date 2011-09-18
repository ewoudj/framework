var onServer = (typeof window === 'undefined');

exports = module.exports = {
	version: '0.1.0',
	control: require('./public/controls/control').control,
	utils: require('./public/controls/control').utils,
	page: require('./public/controls/page'),
	topbar: require('./public/controls/topbar'),
	rest: require('./public/net/rest'),
	list: require('./public/controls/list').list,
	form: require('./public/controls/form').form,
	model: require('./public/data/model'),
	store: require('./public/data/store').store,
	textcontrol: require('./public/controls/formtextcontrol').control,
	memoControl: require('./public/controls/formmemocontrol').control,
	referenceControl: require('./public/controls/formreferencecontrol').control,
	referenceListControl: require('./public/controls/formreferencelistcontrol').control,
	radioControl: require('./public/controls/formradiocontrol').control,
	application: require('./public/controls/application').application,
	httpserver: onServer ? require('./private/server/http') : null,
	models: {
		user: require('./public/models/user.js')
	}
};
