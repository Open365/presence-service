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
var Hippie4eyeos = require('eyeos-hippie');
var BusExpectation = require('bus-expectation');
var BusSpy = BusExpectation.BusSpy;

var hippie4Eyeos = new Hippie4eyeos();
var domain = '@open365.io';
var timeout;

function doEyeosLogin(doneExercise) {
    hippie4Eyeos.login(doneExercise, 'eyeos', 'eyeos');
}

setup(function (done) {
	timeout = 60000;
    hippie4Eyeos = new Hippie4eyeos();
	doEyeosLogin(done);
});

suite('#unauthorized request', function () {
	test('should return status 401 when requesting without a valid card and signature', function (done) {
		hippie4Eyeos.basicRequest()
            .timeout(timeout)
			.parser(function(body, fn) {
				fn(null, body);
			})
			.get('/vdi/v1/vm')
			.expectStatus(401)
			.end(done);
	});
});

suite("# login", function () {
    test('should send an onlineUser message to user exchange', function (done) {
        var busSpy = new BusSpy();
        busSpy.onDestination('/exchange/user_eyeos' + domain + '/user_eyeos' + domain)
            .exercise(function (doneExercise) {
                hippie4Eyeos.logout(doneExercise, true);
            })
            .expectBodyProperties({
                type: 'onlineUser',
                data: '{"user":"eyeos"}'
            })
            .done(function () {
                done();
            });
    });

});

suite("# logout", function () {
    test('should send an offlineUser message to user exchange', function (done) {
        var busSpy = new BusSpy();
        busSpy.onDestination('/exchange/user_eyeos' + domain + '/user_eyeos' + domain)
            .exercise(function (doneExercise) {
                hippie4Eyeos.logout(doneExercise, true);
            })
            .expectBodyProperties({
                type: 'offlineUser',
                data: '{"user":"eyeos"}'
            })
            .done(function () {
                done();
            });
	});

});

suite("#get online users", function () {
    setup(function (done) {
    	hippie4Eyeos.login(function () {
            hippie4Eyeos.login(done, "eyeos2", "eyeos");
        }, "eyeos1", "eyeos");
    });

    test("should return 200 and an array of all online users", function (done) {
        hippie4Eyeos.basicRequestWithCardAndSignature()
            .timeout(timeout)
            .get("/presenceInformation/v1/online")
            .expectStatus(200)
            .expect(function (res, body, next) {
                assert.include(body, "eyeos");
                assert.include(body, "eyeos1");
                assert.include(body, "eyeos2");
                next();
            })
            .end(done);
    });
});

suite('#ping', function () {
	test('should send a pong to user queue', function (done) {
        function sendPingToPresence(exerciseDone) {
            hippie4Eyeos.basicRequestWithCardAndSignature()
                .timeout(timeout)
                .post('/relay/presence/v1/userEvent/ping')
                .parser(function(body, fn) {
                    console.log(body);
                    fn(null, body);
                })
                .end(exerciseDone);
        }

        var busSpy = new BusSpy();
        busSpy.onDestination('/queue/user_eyeos' + domain)
            .timeout(timeout)
            .exercise(sendPingToPresence)
            .expectBodyProperties({
                type: 'pong'
            })
            .done(done);
	});

});
