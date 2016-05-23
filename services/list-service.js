var _ = require('lodash');
var BaseService = require('./base-service');

var ListService = function () {
	BaseService.call(this);
	this.aggregate = 'lists';
};

ListService.prototype = _.create(BaseService.prototype, {
	constructor: ListService
});

module.exports = new ListService();
