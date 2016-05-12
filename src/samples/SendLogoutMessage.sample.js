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

var Client = require('eyeos-consume-service').Client;

var headers = {
	'card': JSON.stringify({
		'username': 'fake.user',
		'expiration': 987654310
	}),
	'signature': 'fake signature'
};
var msg = {
	'timestamp': 1234567890
};

var client = new Client();
//// if rabbit is in management
//var client = new Client({
//    host: '10.11.12.200',
//    port: 5672
//});
client.post('amqp.exchange://presence/v1/userEvent/logout', headers, JSON.stringify(msg), '');