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
var DataParser = require('../lib/DataParser');

suite('DataParser Suite', function () {
	var sut;
	var timestamp, clock;
	var username = 'fake username',
		password = 'fake password',
		card = '{"username":"fake username"}',
		signature = 'fake signature',
		data = {
			card: card,
			signature: signature,
			document: {password: password}
		};

	setup(function () {
		clock = sinon.useFakeTimers();
		timestamp = new Date().getTime();
		sut = new DataParser();
	});

	teardown(function () {
		clock.restore();
	});

	suite('#getLoginData', function () {
		function execute () {
			return sut.getLoginData(data);
		}

		test('returns data to save', function () {
			var expected = {
				username: username,
				password: password,
				loginTs: timestamp,
				signature: signature,
				card: '{"username":"fake username"}'
			};
			assert.deepEqual(execute(), expected);
		});
	});

	suite('#getPingData', function () {
		function execute () {
			return sut.getPingData(data);
		}

		test('returns data to save', function () {
			var expected = {
				username: username,
				lastPingTs: timestamp,
				signature: signature,
				card: '{"username":"fake username"}'
			};
			assert.deepEqual(execute(), expected);
		});
	});

	suite('#getDeleteData', function () {
		function execute () {
			return sut.getDeleteData(data)
		}

		test('return data to delete', function () {
			var expected = {
				username: username
			};
			assert.deepEqual(execute(), expected);
		});
	});
});
