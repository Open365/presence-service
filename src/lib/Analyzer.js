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

var Analyzer = function () {
	this.logger = log2out.getLogger("Analyzer");
};

Analyzer.prototype.setAnalyzedRequest = function (analyzedRequest) {
	this.analyzedRequest = analyzedRequest;
};

Analyzer.prototype.getRequest = function () {
	var request = '';
	// userEvent = [ ping | logout ]
	if (this.analyzedRequest.method === 'POST'
		&& this.analyzedRequest.parameters.userEvent
		&& typeof(this.analyzedRequest.headers.card) != 'undefined') {
		request = this.analyzedRequest.parameters.userEvent;
	} else if (this.analyzedRequest.userPath === '/userEvent/getUsers') {
		request = this.analyzedRequest.parameters.userEvent;
	}
	return request;
};

Analyzer.prototype.getData = function () {
	return {
		card: this.analyzedRequest.headers.card,
		signature: this.analyzedRequest.headers.signature,
		parameters: this.analyzedRequest.parameters,
		document: this.analyzedRequest.document,
		TID: this.analyzedRequest.headers["X-eyeos-TID"]
	};
};

Analyzer.prototype.getUsername = function () {
	return this.analyzedRequest.headers.card.username
};

module.exports = Analyzer;
