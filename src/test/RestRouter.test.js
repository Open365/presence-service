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

'use strict';
var sinon = require('sinon');
var RestRouter = require('../lib/RestRouter');
var Analyzer = require('../lib/Analyzer');
var Presence = require('../lib/Presence');
var Response = require('../lib/ResponseFactory');

suite('RouterTest', function () {
	var sut;
	var analyzer, presence, response, endStub;
	var analyzedRequest, request, data, username, errData;

	setup(function () {
		request = 'dummy';
		data = 'some fake data';
		username = 'fake.user';
		errData = { username: username };
		analyzer = new Analyzer();
		presence = new Presence();
		response = new Response();
		endStub = sinon.stub();
		sut = new RestRouter(analyzer, presence, response);
	});

	suite('#dispatch', function () {
		function execute () {
			var httpResponse = {
				end: endStub
			};
			sut.dispatch(analyzedRequest, httpResponse);
		}

		test('calls to analyzer.setAnalyzedRequest', sinon.test(function () {
			this.stub(analyzer, 'getUsername').returns(username);
			this.stub(analyzer, 'getRequest').returns(request);
			this.stub(analyzer, 'getData').returns(request);
			this.mock(analyzer)
				.expects('setAnalyzedRequest')
				.once()
				.withExactArgs(analyzedRequest)
				.returns(request);
			execute();
		}));

		test('calls to analyzer.getRequest', sinon.test(function () {
			this.stub(analyzer, 'getUsername').returns(username);
			this.stub(analyzer, 'getData').returns(request);
			this.mock(analyzer)
				.expects('getRequest')
				.once()
				.withExactArgs()
				.returns(request);
			execute();
		}));

		test('calls to analyzer.getData', sinon.test(function () {
			this.stub(analyzer, 'getUsername').returns(username);
			this.stub(analyzer, 'getRequest').returns(request);
			this.mock(analyzer)
				.expects('getData')
				.once()
				.withExactArgs()
				.returns(request);
			execute();
		}));

		test('does not call to response.error when the request does not exist', sinon.test(function () {
			this.stub(analyzer, 'getRequest').returns('notExistingRequest');
			this.stub(analyzer, 'getData').returns('');
			this.stub(analyzer, 'getUsername').returns(username);
			this.mock(response)
				.expects('error')
				.never();
			execute();
		}));

		test('calls to presence.request if it is not falsy', sinon.test(function () {
			this.stub(analyzer, 'getUsername').returns(username);
			this.stub(analyzer, 'getRequest').returns(request);
			this.stub(analyzer, 'getData').returns(data);
			this.mock(presence)
				.expects(request)
				.once()
				.withExactArgs(data, response);
			execute();
		}));

		test('calls to response.error when request is falsy', sinon.test(function () {
			this.stub(analyzer, 'getRequest').returns('');
			this.stub(analyzer, 'getUsername').returns(username);
			this.mock(response)
				.expects('error')
				.once()
				.withExactArgs('Invalid request: ' , analyzedRequest, errData);
			execute();
		}));

		test('calls to response.error when an error is caught', sinon.test(function () {
			var err = new Error();
			this.stub(analyzer, 'getRequest').throws(err);
			this.stub(analyzer, 'getUsername').returns(username);
			execute();
			sinon.assert.calledWith(endStub, 400);
		}));
	});
});
