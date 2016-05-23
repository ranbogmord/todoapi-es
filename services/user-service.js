var _ = require('lodash');
var BaseService = require('./base-service');

var UserService = function () {
	BaseService.call(this);
	this.aggregate = 'users';
};

UserService.prototype = _.create(BaseService.prototype, {
	constructor: UserService
});

module.exports = new UserService();
