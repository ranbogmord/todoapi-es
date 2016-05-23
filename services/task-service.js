var _ = require('lodash');
var BaseService = require('./base-service');

var TaskService = function () {
	BaseService.call(this);
	this.aggregate = 'tasks';
};

TaskService.prototype = _.create(BaseService.prototype, {
	constructor: TaskService
});

module.exports = new TaskService();
