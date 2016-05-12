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
var assert = require('chai').assert;
var settings = require('../settings-test');
var UserQueue = require('../lib/UserQueue');

suite('UserQueue Suite', function () {
	var sut;
	var username, timestamp, message, sendData, domain;
	var err, errMsg, clock;
    var notificationControllerFake;

	setup(function () {
		username = 'fake.user';
		timestamp = 'fake timestamp';
		domain = 'open365.io';
		err = 'fake error';
		errMsg = 'fake error message';
        notificationControllerFake = {
            notifyUser: sinon.spy()
        };

        sut = new UserQueue(notificationControllerFake);
	});

	suite('#pong', function () {
		setup(function () {
			message = {
				type: 'pong',
				data: {
					timestamp: timestamp
				}
			};
			sendData = {
				destination: '/topic/user_' + username,
				body: JSON.stringify(message)
			};
		});

		teardown(function() {
		});

		function execute () {
			var data = { username: username, lastPingTs: timestamp, card: '{"domain":"' + domain + '"}' };
			sut.pong(data);
		}
		
		test('calls to notificationController.notifyUser', function () {
			execute();

            sinon.assert.calledOnce(notificationControllerFake.notifyUser);

            var callArguments = notificationControllerFake.notifyUser.firstCall.args;
            var notification = callArguments[0];
            assert.equal(notification.type, 'pong');
            assert.property(notification, 'data');

            var targetUsername = callArguments[1];
			var fullUsername = username+'@'+domain;
			assert.equal(fullUsername, targetUsername);

            var useQueue = callArguments[2];
            assert.isTrue(useQueue);
		});
	});

});
