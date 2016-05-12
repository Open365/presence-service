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

var PersistenceFactory = require('./persistence/PersistenceFactory');
var DataParser = require('./DataParser');
var log2out = require('log2out');
var PresenceNotification = require('./PresenceNotification');
var settings = require('../lib/settings');

var Presence = function (persistenceFactory, dataParser, tracer, presenceNotification) {
	this.logger = log2out.getLogger("Presence");
	this.tracer = tracer || log2out.getLogger('Presence');
	this.tracer.setFormater('TransactionFormater');
	var factory = persistenceFactory || new PersistenceFactory();
	this.persistence = factory.getPersistence();
	this.dataParser = dataParser || new DataParser();
    this.presenceNotification = presenceNotification || new PresenceNotification();
};

Presence.prototype.dummy = function () {
	// For TEST only
};

Presence.prototype.getUsers = function(data, responseFinisher) {
	responseFinisher.setReplyTo(data.document.replyTo);
	this.persistence.find(data, responseFinisher);

};

Presence.prototype.login = function(data, responseFinisher) {
	try {
		var card = JSON.parse(data.card);
		var username = data.document.username;
		var domain = card.domain;

		var saveData = this.dataParser.getLoginData(data);
		this.persistence.save(saveData, responseFinisher);

		this.presenceNotification.notifyOnlineUser(username, {card: data.card, signature: data.signature}, domain);
	} catch(e) {
		responseFinisher.error('Failed to notify other users about a new online user since the card is incorrect', e);
	}
};

Presence.prototype.ping = function (data, responseFinisher) {
	var saveData = this.dataParser.getPingData(data);
	this.persistence.save(saveData, responseFinisher);
};

Presence.prototype.logout = function (data, responseFinisher) {

	this.tracer.info('Log out petition', data.TID, data.signature);
	var removeData = this.dataParser.getDeleteData(data);
	this.persistence.delete(removeData, responseFinisher);
    try {
		var card = JSON.parse(data.card);
        var username = card.username;
        var domain = card.domain;
		this.presenceNotification.notifyOfflineUser(username, {card: data.card, signature: data.signature}, domain);
    } catch(e) {
		responseFinisher.error('Failed to notify other users about a new offline user since the card is incorrect', e);
    }
};

module.exports = Presence;
