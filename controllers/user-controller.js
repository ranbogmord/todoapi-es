var router = require('express').Router();
var userService = require('../services/user-service');
var _ = require('lodash');

router.get('/', function (req, res) {
	userService.findAll(function (err, users) {
		if (err) {
			return res.status(500).json(err);
		}

		return res.json(users);
	});
});

router.get('/:userId', function (req, res) {
	userService.find(req.params.userId, function (err, user) {
		if (err) {
			return res.status(500).json(err);
		}

		if (!user) {
			return res.status(404).json({
				error: 'User not found'
			});
		}

		return res.json(user);
	});
});

router.post('/', function (req, res) {
	userService.create(req.body, function (err, user) {
		if (err) {
			return res.status(500).json(err);
		}

		return res.status(201).json(user);
	});
});

router.put('/:userId', function (req, res) {
	var uid = req.params.userId;

	userService.update(_.extend(req.body, {_id: uid}), function (err, user) {
		if (err) {
			return res.status(500).json(err);
		}

		return res.json(user);
	});
});

module.exports = router;
