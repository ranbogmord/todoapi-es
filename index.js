var eventstore = require('eventstore');
var config = require('./config');
var es = eventstore(config.eventstore);
var moment = require('moment');
var util = require('util');

var express = require('express');
var app = express();
var bp = require('body-parser');
app.use(bp.json());

app.use(function (req, res, next) {
	console.log(util.format('[%s] %s %s', moment().format(), req.method, req.path));
	next();
});

app.get('/', function (req, res) {
	return res.json({
		ping: Date.now()
	});
});

app.get('/event-stream', function (req, res) {
	es.getEvents(function (err, events) {
		if (err) { return res.status(500).json(err); }

		if (req.query.until) {
			var until = moment(req.query.until);
			if (!until) {
				return res.status(400).json({error: 'invalid date'});
			}

			events = events.filter(function (ev) {
				var eventDate = moment(ev.commitStamp);
				return eventDate.format('x') <= until.format('x');
			});
		}

		return res.json(events);
	});
});

app.use('/users', require('./controllers/user-controller'));
app.use('/lists', require('./controllers/list-controller'));

es.init(function () {
	app.listen(3000, function () {
		console.log('App running');
	});
});
