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
var settings = require('./settings.js');
var userNotification = require('eyeos-usernotification');
var PONG = 'pong';

var UserQueue = function (notificationController) {
	this.logger = log2out.getLogger("UserQueue");
    this.notificationController = notificationController || new userNotification.NotificationController();
};

UserQueue.prototype.pong = function (data) {
    var domain = JSON.parse(data.card).domain;
    var username = data.username.trim() + '@' + domain;
    this.logger.debug('sending PONG to:', username);
    var dataTxt = JSON.stringify({
        timestamp: data.lastPingTs
    });
    var notification = new userNotification.Notification(PONG, dataTxt);
    var useUserQueue = true;
    this.notificationController.notifyUser(notification, username, useUserQueue);
};

module.exports = UserQueue;
