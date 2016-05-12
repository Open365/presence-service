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

var MongoPersistenceCallback = function () {
	this.logger = log2out.getLogger("MongoPersistenceCallback");
};

MongoPersistenceCallback.prototype.findDone = function(responseFinisher, data, err, result) {
	this.logger.debug('findDone');
	if (!responseFinisher) {
		this.logger.warn('No response finisher defined');
		return;
	}
	if (err) {
		this.logger.error('Error: ', err);
		responseFinisher.error('Error in find: ', err, data);
	} else {
		this.logger.debug('Result: ', data);
		responseFinisher.success(data);
	}
};

MongoPersistenceCallback.prototype.updateDone = function (responseFinisher, data, err, result) {
	this.logger.debug('updateDone');
	if (!responseFinisher) {
		this.logger.warn('No response finisher defined');
		return;
	}
	if (err) {
		this.logger.error('Error: ', err);
		responseFinisher.error('Error in update: ', err, data);
	} else {
		this.logger.debug('Result: ', result);
		responseFinisher.success(data);
	}
};

MongoPersistenceCallback.prototype.removeDone = function (responseFinisher, err, data, result) {
	this.logger.debug('removeDone');
	if (!responseFinisher) {
		this.logger.warn('No response finisher defined');
		return;
	}
	if (err) {
		this.logger.error('Error: ', err);
		responseFinisher.error('Error in remove: ', err, data);
	} else {
		this.logger.debug('Result: ', result);
		responseFinisher.success(data);
		this.logger.debug('Removed!');
	}
};

module.exports = MongoPersistenceCallback;
