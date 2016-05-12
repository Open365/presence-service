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
var PersistenceFactory = require('./persistence/PersistenceFactory');

var Router = function (persistence) {
    this.logger = log2out.getLogger("Router");
    if(persistence) {
        this.persistence = persistence;
    } else {
        var factory = new PersistenceFactory();
        this.persistence = factory.getPersistence();
    }
};

Router.prototype.dispatch = function (analyzedRequest, httpResponse) {
    this.logger.debug('Request', analyzedRequest);
    try {
        if(analyzedRequest.userPath === '/online') {
            this.persistence.find(null, {
                error: function() {},
                success: function(users) {
                    var usersReceived = [];
                    for(var i= 0;i<users.length;i++) {
                        var username = users[i].username;
                        usersReceived.push(username);
                    }
                    httpResponse.end(usersReceived);
                }
            });
        } else {
            httpResponse.end('Unrecognized request');
        }
    } catch (err) {
        this.logger.error('Error processing request: ', analyzedRequest);
    }
};

module.exports = Router;
