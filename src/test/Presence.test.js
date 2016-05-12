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

require('log2out').clearAppenders();

var sinon = require('sinon');
var assert = require('chai').assert;
var Presence = require('../lib/Presence');
var DataParser = require('../lib/DataParser');
var DummyPersistence = require('../lib/persistence/dummy');
var log2out = require('log2out');
var PresenceNotification = require('../lib/PresenceNotification');

suite('PresenceTest', function () {
	var sut;
	var username, timestamp, signature, tid;
	var fakePersistence, data, responseFinisher;
	var dataParser, tracer, tracerInfoStub;
    var presenceNotification, notifyOnlineUserStub, notifyOfflineUserStub;
	setup(function () {
		username = 'fake username';
		timestamp = 'fake timestamp';
		signature = 'fake signature';
		tid = '550e8400-e29b-41d4-a716-446655440000';
		fakePersistence = new DummyPersistence();
		data = {
			card: '{ "username": "'+username+'", "domain":"open365.io" }',
			document: { username: 'testuser', timestamp: timestamp },
			signature: signature,
			TID: tid
		};
		responseFinisher = 'fake responseFinisher';
		var fakeFactory = {
			getPersistence: function () {
				return fakePersistence;
			}
		};
		dataParser = new DataParser();

		tracer = log2out.getLogger('Presence');

        presenceNotification = new PresenceNotification();
        notifyOnlineUserStub = sinon.stub(presenceNotification, 'notifyOnlineUser');
        notifyOfflineUserStub = sinon.stub(presenceNotification, 'notifyOfflineUser');

		sut = new Presence(fakeFactory, dataParser, tracer, presenceNotification);
	});

	suite('#getUsers', function() {
		var findData, replyTo;

		setup(function() {
			responseFinisher = {setReplyTo: function() {}};
			replyTo = 'user-drive-mounter';
			findData = {
				document: {
					replyTo: replyTo
				}
			};
		});

		test('calls response setReplyTo with correct param', sinon.test(function() {
			this.mock(responseFinisher)
				.expects('setReplyTo')
				.once()
				.withExactArgs(replyTo);
			sut.getUsers(findData, responseFinisher);
		}));

		test('calls to persistence.find', sinon.test(function () {
			this.mock(fakePersistence)
				.expects('find')
				.once()
				.withExactArgs(findData, responseFinisher);
			sut.getUsers(findData, responseFinisher);
		}));
	});

	suite('#login', function() {
		var saveData;

		function execute () {
			saveData = 'fake data';
			sut.login(data, responseFinisher);
		}

		test('calls to dataParser.getLoginData', sinon.test(function () {
			this.mock(dataParser)
				.expects('getLoginData')
				.once()
				.withExactArgs(data)
				.returns(saveData);
			execute();
		}));

		test('calls to persistence.save', sinon.test(function () {
			this.stub(dataParser, 'getLoginData').returns(saveData);
			this.mock(fakePersistence)
				.expects('save')
				.once()
				.withExactArgs(saveData, responseFinisher);
			execute();
		}));

        test('calls to PresenceNotification to notifyOnlineUser with the correct user', function() {
            execute();
            assert(notifyOnlineUserStub.calledWith(data.document.username), "Failed to notify about online user");
        });
	});

	suite('#ping', function () {
		var saveData;

		function execute () {
			saveData = 'fake data';
			sut.ping(data, responseFinisher);
		}

		test('calls to dataParser.getPingData', sinon.test(function () {
			this.mock(dataParser)
				.expects('getPingData')
				.once()
				.withExactArgs(data)
				.returns(saveData);
			execute();
		}));

		test('calls to persistence.save', sinon.test(function () {
			this.stub(dataParser, 'getPingData').returns(saveData);
			this.mock(fakePersistence)
				.expects('save')
				.once()
				.withExactArgs(saveData, responseFinisher);
			execute();
		}));
	});
	
	suite('#logout', function () {
		var removeData;

		function execute () {
			removeData = {
				username: username
			};
			sut.logout(data, responseFinisher);
		}

		test('calls to dataParser.getDeleteData', sinon.test(function () {
			this.mock(dataParser)
				.expects('getDeleteData')
				.once()
				.withExactArgs(data)
				.returns(removeData);
			execute();
		}));

		test('calls to persistence.delete', sinon.test(function () {
			this.stub(dataParser, 'getDeleteData').returns(removeData);
			this.mock(fakePersistence)
				.expects('delete')
				.once()
				.withArgs(removeData);
			execute();
		}));

		test('Logs trace with correct message', function(){
			tracerInfoStub = sinon.stub(tracer, 'info');
		    execute();
			assert(tracerInfoStub.calledWithExactly('Log out petition', tid, signature), 'Tracer.info not called or called with wrong parameters');
		});

        test('calls to PresenceNotification to notifyOfflineUser with the correct user', function() {
            execute();
            assert(notifyOfflineUserStub.calledWith(username), "Failed to notify about offline user");
        });
	});
});
