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
var MongoPersistenceCallback = require('../lib/persistence/mongo/MongoPersistenceCallback');
var Response = require('../lib/ResponseFactory');

suite('MongoPersistenceCallback Suite', function () {
	var sut;
	var responseFinisher, err, result, data;

	setup(function () {
		err = false;
		result = 'fake result';
		data = 'fake data';
		responseFinisher = new Response();
		sut = new MongoPersistenceCallback();
	});

	suite('#findDone', function () {

		test('calls to responseFinisher.error when error', sinon.test(function () {
			err = new Error();
			this.mock(responseFinisher)
				.expects('error')
				.once()
				.withExactArgs('Error in find: ', err, data);
			sut.findDone(responseFinisher, data, err, result);
		}));

		test('calls to responseFinisher.success when ok', sinon.test(function () {
			this.mock(responseFinisher)
				.expects('success')
				.once()
				.withExactArgs(data);
			sut.findDone(responseFinisher, data, err, result);
		}));
	});

	suite('#updateDone', function () {
		function execute (err, result) {
			sut.updateDone(responseFinisher, data, err, result);
		}

		test('calls to responseFinisher.error when error', sinon.test(function () {
			err = new Error();
			this.mock(responseFinisher)
				.expects('error')
				.once()
				.withExactArgs('Error in update: ', err, data);
			execute(err, result)
		}));
		
		test('calls to responseFinisher.success when ok', sinon.test(function () {
			this.mock(responseFinisher)
				.expects('success')
				.once()
				.withExactArgs(data);
			execute(err, result)
		}));
	});

});
