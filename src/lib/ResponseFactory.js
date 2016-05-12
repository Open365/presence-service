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
var PingResponse = require('./PingResponse');
var GetUsersResponse = require('./GetUsersResponse');
var LoginResponse = require('./LoginResponse');
var LogoutResponse = require('./LogoutResponse');

var ResponseFactory = function () {
	this.logger = log2out.getLogger("Response");
};

ResponseFactory.prototype.ping = function(httpResponse) {
	return new PingResponse(null, httpResponse);
};

ResponseFactory.prototype.login = function(httpResponse) {
	return new LoginResponse(httpResponse);
};

ResponseFactory.prototype.logout = function(httpResponse) {
	return new LogoutResponse(httpResponse);
};

ResponseFactory.prototype.getUsers = function(httpResponse) {
	return new GetUsersResponse(httpResponse);
};

ResponseFactory.prototype.dummy = function() {
	return this;
};

ResponseFactory.prototype.success = function (data) {
	this.logger.debug('.success: ', data);
};

ResponseFactory.prototype.error = function (msg, err, data) {
	this.logger.error(msg, err, data);
};

module.exports = ResponseFactory;
