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

var log2out = require('log2out');
var mongoDriverSingleton = require('eyeos-mongo').mongoDriverSingleton;
var settings = require('../../settings');
var MongoPersistenceCallback = require('./MongoPersistenceCallback');

var MongoPersistence = function (injectedMongoDriverSingleton, persistanceCallback) {
	this.logger = log2out.getLogger("MongoPersistence");
	this.mongoDriverSingleton = injectedMongoDriverSingleton || mongoDriverSingleton;
 	this.collectionName = settings.persistence.collection;
	this.persistenceCallback = persistanceCallback || new MongoPersistenceCallback();
};

var getCollection = function () {
	var mongoDriver = this.mongoDriverSingleton.getMongoDriver();
	return mongoDriver.getCollection(this.collectionName);
};

MongoPersistence.prototype.find = function(data, responseFinisher) {
	this.logger.debug('find: ', data);
	var collection = getCollection.call(this),
		query = {};
	var self = this;
	collection.find(query).toArray(function findAllToArray(err, docs) {
		self.persistenceCallback.findDone(responseFinisher, docs);
	});
};

MongoPersistence.prototype.save = function (data, responseFinisher) {
	this.logger.debug('save: ', data);
	var collection = getCollection.call(this),
		query = { username: data.username },
		options = { upsert: true };	//  creates a new document when no document matches the query criteria.
	collection.update(query, {$set: data}, options, this.persistenceCallback.updateDone.bind(this.persistenceCallback, responseFinisher, data));
};

MongoPersistence.prototype.delete = function (data, responseFinisher) {
	this.logger.debug('delete: ', data);
	var collection = getCollection.call(this);
	collection.remove(data, this.persistenceCallback.removeDone.bind(this.persistenceCallback, responseFinisher))
};

module.exports = MongoPersistence;
