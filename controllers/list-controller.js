var router = require('express').Router();
var _ = require('lodash');
var listService = require('../services/list-service');
var taskService = require('../services/task-service');

var getFilters = function (query) {
	var filters = {};
	if (query.userId) {
		filters.userId = _.toInteger(query.userId);
	}

	return filters;
};

router.param('listId', function (req, res, next, listId) {
	listService.find(listId, function (err, list) {
		if (err) { return res.status(500).json(err); }
		if (!list) { return res.status(404).json({error: 'list not found'}); }

		req.list = list;
		next();
	});
});

router.param('taskId', function (req, res, next, taskId) {
	taskService.find(taskId, function (err, task) {
		if (err) { return res.status(500).json(err); }
		if (!task) { return res.status(404).json({error: 'task not found'}); }

		req.task = task;
		next();
	});
});

router.get('/', function (req, res) {
	var filters = getFilters(req.query);
	listService.findAll(filters, function (err, lists) {
		if (err) {
			return res.status(500).json(err);
		}

		return res.json(lists);
	});
});

router.get('/:listId', function (req, res) {
	return res.json(req.list);
});

router.post('/', function (req, res) {
	listService.create(req.body, function (err, list) {
		if (err) {
			return res.status(500).json(err);
		}

		return res.status(201).json(list);
	});
});

router.put('/:listId', function (req, res) {
	listService.update(_.extend(req.body, {_id: req.list._id}), function (err, list) {
		if (err) {
			return res.status(500).json(err);
		}

		return res.json(list);
	});
});

router.get('/:listId/tasks', function (req, res) {
	taskService.findAll({listId: req.list._id}, function (err, tasks) {
		if (err) {
			return res.status(500).json(err);
		}

		return res.json(tasks);
	});
});

router.get('/:listId/tasks/:taskId', function (req, res) {
	return res.json(req.task);
});

router.post('/:listId/tasks', function (req, res) {
	var payload = _.extend(req.body, {listId: req.list._id});
	taskService.create(payload, function (err, task) {
		if (err) { return res.status(500).json(err); }

		return res.status(201).json(task);
	});
});

router.put('/:listId/tasks/:taskId', function (req, res) {
	taskService.update(_.extend(req.body, {_id: req.task._id}), function (err, task) {
		if (err) { return res.status(500).json(err); }

		return res.json(task);
	});
});

module.exports = router;
