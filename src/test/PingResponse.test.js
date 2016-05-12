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

'use strict';
var sinon = require('sinon');
var PingResponse = require('../lib/PingResponse');
var UserQueue = require('../lib/UserQueue');

suite('PingResponseTest', function () {
	var sut;
	var client, httpResponse, username;
    var stompClientFake;

	setup(function () {
        stompClientFake = {send: function(){}, connect: function(){}};
		username = 'fake user';
		httpResponse = {
			end: sinon.stub()
		};
		client = new UserQueue({notifyUser: sinon.spy()});
		sut = new PingResponse(client, httpResponse);
	});

	suite('#success', function () {
		test('calls to response.end', sinon.test(function () {
			this.mock(client)
				.expects('pong')
				.once()
				.withExactArgs(username);
			sut.success(username);
		}));
	});
});
