/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

var sinon = require('sinon');
var assert = require('chai').assert;
var MongoPersistence = require('../lib/persistence/mongo');
var MongoPersistenceCallback = require('../lib/persistence/mongo/MongoPersistenceCallback');
var settings = require('../settings-test');

suite('MongoPersistence Suite', function () {
	var sut;
	var username, timestamp, data, persistanceCallback, docs, response;
	var mongoDriverSingleton, mongoDriver, collection, collectionFind;

	setup(function () {
		persistanceCallback = new MongoPersistenceCallback();
		collectionFind = {toArray: function() {}};
		username = "fake username";
		timestamp = "fake timestamp";
		collection = { update: function(){}, remove: function(){}, find: function() { return collectionFind} };
		mongoDriver = { getCollection: function(){ return collection; } };
		mongoDriverSingleton = { getMongoDriver: function(){ return mongoDriver; }, update: function(){} };
		sut = new MongoPersistence(mongoDriverSingleton);
	});

	suite('#find', function() {
		setup(function() {
			data = {
				username: username
			};
		});

		test('calls to mongoDriverSingleton.getMongoDriver', sinon.test(function () {
			this.mock(mongoDriverSingleton)
				.expects('getMongoDriver')
				.once()
				.withExactArgs()
				.returns(mongoDriver);
			sut.find(data);
		}));
		test('calls to mongoDriverSingleton.getCollection', sinon.test(function () {
			this.stub(mongoDriverSingleton, 'getMongoDriver').returns(mongoDriver);
			this.mock(mongoDriver)
				.expects('getCollection')
				.once()
				.withExactArgs(settings.persistence.collection)
				.returns(collection);
			sut.find(data);
		}));
		test('calls to collection.find', sinon.test(function() {
			var query = {};
			this.stub(mongoDriverSingleton, 'getMongoDriver').returns(mongoDriver);
			this.mock(collection)
				.expects('find')
				.once()
				.withExactArgs(query).returns(collectionFind);
			sut.find(data);
		}));

		test('calls to persistanceCallback findeOne', function() {
			this.stub(mongoDriverSingleton, 'getMongoDriver').returns(mongoDriver);
			this.stub(collectionFind, 'toArray', function(cb) {cb(null, docs);});
			this.mock(persistanceCallback)
				.expects('findDone')
				.once()
				.withExactArgs(response, docs);
			sut.find(data, response);
		});
	});

	suite('#save', function () {
		setup(function () {
			data = { username: username, timestamp: timestamp };
		});
		function execute () {
			sut.save(data);
		}
		test('calls to mongoDriverSingleton.getMongoDriver', sinon.test(function () {
			this.mock(mongoDriverSingleton)
				.expects('getMongoDriver')
				.once()
				.withExactArgs()
				.returns(mongoDriver);
			execute();
		}));
		test('calls to mongoDriverSingleton.getCollection', sinon.test(function () {
			this.stub(mongoDriverSingleton, 'getMongoDriver').returns(mongoDriver);
			this.mock(mongoDriver)
				.expects('getCollection')
				.once()
				.withExactArgs(settings.persistence.collection)
				.returns(collection);
			execute();
		}));
		test('calls to collection.update', sinon.test(function () {
			var query = { username: username },
				options = { upsert: true };
			this.mock(collection)
				.expects('update')
				.once()
				.withExactArgs(query, {$set:data}, options, sinon.match.func);
			execute();
		}));
	});

	suite('#delete', function () {
		setup(function () {
			data = { username: username };
		});
		function execute () {
			sut.delete(data);
		}
		test('calls to mongoDriverSingleton.getMongoDriver', sinon.test(function () {
			this.mock(mongoDriverSingleton)
				.expects('getMongoDriver')
				.once()
				.withExactArgs()
				.returns(mongoDriver);
			execute();
		}));
		test('calls to mongoDriverSingleton.getCollection', sinon.test(function () {
			this.stub(mongoDriverSingleton, 'getMongoDriver').returns(mongoDriver);
			this.mock(mongoDriver)
				.expects('getCollection')
				.once()
				.withExactArgs(settings.persistence.collection)
				.returns(collection);
			execute();
		}));
		test('calls to collection.update', sinon.test(function () {
			this.mock(collection)
				.expects('remove')
				.once()
				.withExactArgs(data, sinon.match.func);
			execute();
		}));
	});
});
