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
var Analyzer = require('./Analyzer');
var Presence = require('./Presence');
var ResponseFactory = require('./ResponseFactory');

var Router = function (analyzer, presence, response) {
	this.logger = log2out.getLogger("Router");
	this.analyzer = analyzer || new Analyzer();
	this.presence = presence || new Presence();
	this.response = response || new ResponseFactory();
};

function sendError (msg, err) {
	var data = { username: this.analyzer.getUsername() };
	this.response.error(msg, err, data);
}

Router.prototype.dispatch = function (analyzedRequest, httpResponse) {
	this.logger.debug('Request', analyzedRequest);
	var request, data;
	try {
		this.analyzer.setAnalyzedRequest(analyzedRequest);
		request = this.analyzer.getRequest();
		if (request) {
			data = this.analyzer.getData();
			if (! this.presence[request]) {
				this.logger.debug("Ignoring request: received request of type: [", request, "] and there is no handler for it.");
				return;
			}
			this.presence[request](data, this.response[request](httpResponse));
		} else {
			sendError.call(this, 'Invalid request: ', analyzedRequest);
		}
	} catch (err) {
		console.log('Error in request: ', err);
		httpResponse.end(400);
	}
};

module.exports = Router;
