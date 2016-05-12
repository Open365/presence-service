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
var Client = require('eyeos-consume-service').Client;

var GetUsersResponse = function (httpResponse, client) {
    this.logger = log2out.getLogger("GetUsersResponse");
    this.httpResponse = httpResponse;
    this.client = client || new Client({options: {durable: false,exclusive: false,autoDelete: true}});
};

GetUsersResponse.prototype.setReplyTo = function(replyTo) {
    this.replyTo = replyTo;
};

GetUsersResponse.prototype.success = function (data) {
    this.logger.debug('.success');
    var message = {
        type: 'mountUsersDrive',
        data: {
            users: data
        }
    };
    this.client.post("amqp://" + this.replyTo, {}, JSON.stringify(message));
    this.httpResponse.end(message);
};

GetUsersResponse.prototype.error = function (msg, err, data) {
    this.logger.error(msg, err, data);
    this.httpResponse.reject(data);
};

module.exports = GetUsersResponse;
