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
var https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var userNotification = require('eyeos-usernotification');
var Notification = userNotification.Notification;
var NotificationController = userNotification.NotificationController;

var PresenceNotification = function (notificationController, injectedHttps) {
    this.logger = log2out.getLogger("Presence");
    this.notificationController = notificationController || new NotificationController();
    this.https = injectedHttps || https;
};

PresenceNotification.prototype.notifyOnlineUser = function (user, headers, domain) {
    this._notify(user, 'onlineUser', headers, domain);
};

PresenceNotification.prototype.notifyOfflineUser = function (user, headers, domain) {
    this._notify(user, 'offlineUser', headers, domain);
};

PresenceNotification.prototype._notify = function (user, type, headers, domain) {
    var self = this;
    //Getting contacts from principal service public API in order to not duplicate logic here
    //Pending to create a library shared between presence and principal services
    this.https.request({
        host: 'proxy.service.consul',
        path: '/principalService/v1/principals/contacts/me',
        method: 'GET',
        headers: headers
    }, function (response) {
        var body = '';
        response.on('data', function(chunk) {
            body += chunk;
        });

        response.on('error', function(err) {
            self.logger.error('Error getting contacts to notify: ', err);
        });

        response.on('end', function() {
            try {
                var users = JSON.parse(body);
                var usersReceived = [];
                for(var i= 0;i<users.length;i++) {
                    var username = users[i].principalId;
                    if (!domain) {
                        usersReceived.push(username);
                    }
                    else {
                        usersReceived.push(username + '@' + domain);
                    }
                }
                var notification = new Notification(type, JSON.stringify({user: user}));
                self.notificationController.notify(notification, usersReceived, true);
            } catch (err) {
                self.logger.error('Error getting contacts to notify: ', err);
            }
        });
    }).end();
};

module.exports = PresenceNotification;
