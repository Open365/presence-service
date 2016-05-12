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
var Analyzer = require('../lib/Analyzer');

suite('AnalyzerTest', function () {
	var sut;
	var card = 'fake card';
	var signature = 'fake signature';
	var doc = 'fake document';
	var analyzedRequest;
	var tid;

	setup(function () {
		tid = '550e8400-e29b-41d4-a716-446655440000';
		analyzedRequest = {
			headers: {
				signature: signature,
				card: card,
				"X-eyeos-TID": tid
			},
			document: doc
		};
		sut = new Analyzer();
		sut.setAnalyzedRequest(analyzedRequest);
	});

	suite('#getRequest', function () {
		var TestCase = [
			{ event: 'ping' },
			{ event: 'logout' },
			{ event: 'whatever' }
		];

		function execute () {
			return sut.getRequest();
		}

		test('returns an empty string when the request is invalid', sinon.test(function () {
			var expected = '';
			assert.equal(execute(), expected);
		}));

		test('returns an empty string when the request has not card', sinon.test(function () {
			var expected = '';
			analyzedRequest['parameters'] = { userEvent: 'ping' };
			analyzedRequest['method'] = 'POST';
			delete analyzedRequest.headers.card;
			assert.equal(execute(), expected);
		}));

		TestCase.forEach(function (data) {
			test('returns ' + data.event + ' when the request is a ' + data.event, sinon.test(function () {
				analyzedRequest['parameters'] = { userEvent: data.event };
				analyzedRequest['method'] = 'POST';
				assert.equal(execute(), data.event);
			}));
		});
	});

	suite('#getData', function () {

		function execute () {
			return sut.getData();
		}

		test('returns a plain object with card, signature and parameters', sinon.test(function () {
			var parameters = "fake parameters",
				expected = {
					card: card,
					signature: signature,
					parameters: parameters,
					document: doc,
					TID: tid
			};
			analyzedRequest["parameters"] = parameters;
			assert.deepEqual(execute(), expected);
		}));
	});
});
