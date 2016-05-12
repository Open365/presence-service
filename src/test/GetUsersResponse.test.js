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
var GetUsersResponse = require('../lib/GetUsersResponse');

suite('GetUsersResponse', function () {
    var sut, fakeResponse, client;

    setup(function () {
        client = {post: function() {}};
        fakeResponse = {end:function() {}, reject: function() {}};
        sut = new GetUsersResponse(fakeResponse, client);
    });

    suite('#success', function() {
        var data, replyTo,actual;

        setup(function() {
            data = {
                users: [
                    'user1',
                    'user2'
                ]
            };
            actual = {
                type: 'mountUsersDrive',
                data: {
                    users: data
                }
            };
            replyTo = 'reply';
        });

        test('calls to response.end', sinon.test(function () {
            this.mock(fakeResponse)
                .expects('end')
                .once()
                .withExactArgs(actual);
            sut.success(data);
        }));

        test('calls to client ', sinon.test(function() {
            sut.replyTo = replyTo;
            this.mock(client)
                .expects('post')
                .once()
                .withExactArgs("amqp://"+replyTo, {}, JSON.stringify(actual));
            sut.success(data);
        }));
    });

});
