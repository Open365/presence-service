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

var sinon = require('sinon');
var assert = require('chai').assert;
var Event = require('events').EventEmitter;
var PresenceNotification = require('../lib/PresenceNotification');
var NotificationController = require('eyeos-usernotification').NotificationController;

suite('PresenceNotificationTest', function () {
    var sut, users, domain, notificationController, notifyStub, https, requestStub, response;

    setup(function () {
        users = [
            {principalId: 'user1'},
            {principalId: 'user2'}
        ];
        https = {
            request: function() {}
        };
        domain = "domain";
        response = new Event();
        requestStub = sinon.stub(https, 'request', function(options, callback) {
            callback(response);
            return {end:function() {}};
        });

        notificationController = new NotificationController();
        notifyStub = sinon.stub(notificationController, 'notify');
        sut = new PresenceNotification(notificationController, https);
    });

    suite('#notifyOnlineUser', function() {
        test('Should send a notification for each user', sinon.test(function() {
            sut.notifyOnlineUser('testuser');
            response.emit('data', JSON.stringify(users));
            response.emit('end');
            assert.equal(users.length, notifyStub.args[0][1].length, "Not the same users that are setted");
        }));

        test('Should send the notifications to the correct users', sinon.test(function() {
            sut.notifyOnlineUser('testuser', '', domain);
            response.emit('data', JSON.stringify(users));
            response.emit('end');
            var notifiedUsers = notifyStub.args[0][1];
            for(var i =0;i<notifiedUsers.length;i++) {
                var username = notifiedUsers[i];
                assert.equal(username, users[i].principalId+"@"+domain, "Failed to notify the correct users");
            }
        }));

        test('Should send a notification with correct type', sinon.test(function() {
            sut.notifyOnlineUser('testuser');
            response.emit('data', JSON.stringify(users));
            response.emit('end');
            var type = notifyStub.args[0][0].type;
            assert.equal(type, 'onlineUser', "Failed to notify all online users");
        }));
    });

    suite('#notifyOfflineUser', function() {
        test('Should send a notification for each user', sinon.test(function() {
            sut.notifyOfflineUser('testuser');
            response.emit('data', JSON.stringify(users));
            response.emit('end');
            var usersReceived = notifyStub.args[0][1].length;
            assert.equal(usersReceived, users.length, "Failed to notify all offline users");
        }));

        test('Should send the notifications to the correct users', sinon.test(function() {
            sut.notifyOfflineUser('testuser', '', domain);
            response.emit('data', JSON.stringify(users));
            response.emit('end');
            var notifiedUsers = notifyStub.args[0][1];
            for(var i =0;i<notifiedUsers.length;i++) {
                var username = notifiedUsers[i];
                assert.equal(username, users[i].principalId+"@"+domain, "Failed to notify the offline users");
            }
        }));

        test('Should send a notification with correct type', sinon.test(function() {
            sut.notifyOfflineUser('testuser');
            response.emit('data', JSON.stringify(users));
            response.emit('end');
            var type = notifyStub.args[0][0].type;
            assert.equal(type, 'offlineUser', "Failed to notify all online users");
        }));
    });
});
