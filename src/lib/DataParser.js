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

var DataParser = function () {
	this.logger = log2out.getLogger("DataParser");
};

function execute (data) {
	var card;
	try {
		card = JSON.parse(data.card);
	} catch (err) {
		card = data.card;
	}
	return card;
}

DataParser.prototype.getLoginData = function(data) {
	var card = execute(data);
	return {
		username: card.username,
		password: data.document.password,
		domain: card.domain,
		loginTs: new Date().getTime(),
		card: data.card,
		signature: data.signature
	};
};

DataParser.prototype.getPingData = function (data) {
	var card = execute(data);
	return {
		username: card.username,
		domain: card.domain,
		lastPingTs: new Date().getTime(),
		card: data.card,
		signature: data.signature
	};
};

DataParser.prototype.getDeleteData = function (data) {
	var card = execute(data);
	return {
		username: card.username,
		domain: card.domain
	}
};

module.exports = DataParser;
