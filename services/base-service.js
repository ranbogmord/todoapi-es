var config = require('../config');
var es = require('eventstore')(config.eventstore);
var _ = require('lodash');
es.init(function (err) {
	if (err) {
		throw new Error('Failed to connect to event storage');
	}
});

var singleStreamToObject = function (events) {
	var o = {};
	_.each(events, function (ev) {
		if (!o._id) {
			o._id = ev.aggregateId;
		}

		o = _.extend(o, ev.payload);
	});

	return o;
};

var multipleStreamToObjects = function (events) {
	var streams = {}, objects = [];
	_.each(events, function (ev) {
		if (!streams[ev.aggregateId]) {
			streams[ev.aggregateId] = [];
		}

		streams[ev.aggregateId].push(ev);
	});

	_.each(_.values(streams), function (obj) {
		objects.push(singleStreamToObject(obj));
	});

	return objects;
}

var BaseService = function () {};

BaseService.prototype.getAggregate = function() {
	return this.aggregate;
};

BaseService.prototype.findAll = function() {
	var self = this, filters, callback;

	if (_.isFunction(arguments[0])) {
		filters = {};
		callback = arguments[0];
	} else {
		filters = arguments[0];
		callback = arguments[1];
	}

	es.getEvents({
		aggregate: self.aggregate
	}, function (err, events) {
		var objects;
		if (err) {
			return callback(err);
		}

		if (events.length === 0) {
			return callback(null, []);
		}

		objects = multipleStreamToObjects(events);

		if (filters) {
			objects = _.filter(objects, filters);
		}

		return callback(null, objects);
	});
};

BaseService.prototype.findByContext = function(context, callback) {
	var self = this;
	es.getEvents({
		aggregate: self.aggregate,
		context: context
	}, function (err, events) {
		if (err) {
			return callback(err);
		}

		if (events.length === 0) {
			return callback(null, []);
		}

		return callback(null, multipleStreamToObjects(events));
	});
};

BaseService.prototype.find = function(id, callback) {
	var self = this;

	es.getEventStream({
		aggregate: self.aggregate,
		aggregateId: id
	}, function (err, stream) {
		if (err) {
			return callback(err);
		}

		if (stream.length === 0) {
			return callback(null, null);
		}

		return callback(null, singleStreamToObject(stream.events));
	});
};

BaseService.prototype.create = function(payload, callback) {
	var self = this;
	es.getNewId(function (err, id) {
		if (err) {
			return callback(err);
		}

		es.getEventStream({
			aggregate: self.aggregate,
			aggregateId: id
		}, function (err, stream) {
			if (err) {
				return callback(err);
			}

			delete payload._id;
			stream.addEvent(payload);

			stream.commit(function (err, newStream) {
				if (err) {
					return callback(err);
				}

				callback(null, singleStreamToObject(newStream.events));
			});
		});
	});
};

BaseService.prototype.update = function(payload, callback) {
	var params = [].slice.call(arguments), id, self = this;
	
	id = payload._id;
	delete payload._id;

	es.getEventStream({
		aggregate: self.aggregate,
		aggregateId: id
	}, function (err, stream) {
		if (err) {
			return callback(err);
		}

		if (stream.events.length === 0) {
			return callback(null, null);
		}

		stream.addEvent(payload);
		stream.commit(function (err, newStream) {
			if (err) {
				return callback(err);
			}

			return callback(null, singleStreamToObject(newStream.events));
		});
	});
};

module.exports = BaseService;
