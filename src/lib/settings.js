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
var environment = process.env;


var globals = {
    presenceExchangeName: environment.EYEOS_PRESENCE_SERVICE_BINDTO_EXCHANGENAME_PING || 'presence.v1',
    amqpConnectionHosts: environment.EYEOS_PRESENCE_SERVICE_PRESENCEQUEUE_HOSTS || 'rabbit.service.consul:5672'
};

var presenceExchangeOptions = {
    type: environment.EYEOS_PRESENCE_SERVICE_BINDTO_OPTIONS_TYPE_PING || 'topic',
    durable: environment.EYEOS_PRESENCE_SERVICE_BINDTO_OPTIONS_DURABLE_PING === 'true' || true
};

var logoutMessagesExchangeName = "vdi.user.events.v1";

var settings = {
    rabbitUser: environment.EYEOS_BUS_MASTER_USER || 'guest',
    rabbitPasswd: environment.EYEOS_BUS_MASTER_PASSWD || 'somepassword',
    routeLogoutMessagesToVdiBinding: { // logout messages are routed to vdi-user.events.v1 for deallocate user VM
        hosts: globals.amqpConnectionHosts,
        targetExchange: {
            exchangeName: logoutMessagesExchangeName,
            options: {
                type: 'fanout',
                durable: true
            }
        },
        sourceExchange: {
            exchangeName: globals.presenceExchangeName,
            options: presenceExchangeOptions
        },
        exchangeToExchangeBind: {
            source: globals.presenceExchangeName,
            target: logoutMessagesExchangeName,
            routingKey: 'logout'
        }
    },
	presenceQueue: {
		type: environment.EYEOS_PRESENCE_SERVICE_PRESENCEQUEUE_TYPE || "amqp",
		hosts: globals.amqpConnectionHosts,
        username: environment.EYEOS_BUS_MASTER_USER || 'guest',
        password: environment.EYEOS_BUS_MASTER_PASSWD || 'somepassword',
		queue: {
			name: environment.EYEOS_PRESENCE_SERVICE_PRESENCEQUEUE_QUEUE_NAME || "presence.v1",
			durable: environment.EYEOS_PRESENCE_SERVICE_PRESENCEQUEUE_QUEUE_DURABLE === 'true' || true,
            exclusive: environment.EYEOS_PRESENCE_SERVICE_PRESENCEQUEUE_QUEUE_EXCLUSIVE === 'true' || false,
			autoDelete: false
		},
        subscription: {
            ack: true,
            prefetchCount: parseInt(environment.EYEOS_PRESENCE_SERVICE_PRESENCEQUEUE_PREFETCH_COUNT, 10) || 0
        },
		bindTo: [{
			exchangeName: globals.presenceExchangeName,
			routingKey: environment.EYEOS_PRESENCE_SERVICE_BINDTO_ROUTINGKEY_PING || '#',
			options: presenceExchangeOptions
		}]
	},
    presenceInformationQueue: {
        type: environment.EYEOS_PRESENCE_SERVICE_PRESENCEQUEUE_TYPE || "amqp",
        hosts: globals.amqpConnectionHosts,
        username: environment.EYEOS_BUS_MASTER_USER || 'guest',
        password: environment.EYEOS_BUS_MASTER_PASSWD || 'somepassword',
        queue: {
            name: environment.EYEOS_PRESENCE_SERVICE_PRESENCEQUEUE_QUEUE_NAME || "presenceInformation.v1",
            durable: environment.EYEOS_PRESENCE_SERVICE_PRESENCEQUEUE_QUEUE_DURABLE === 'true' || true,
            exclusive: environment.EYEOS_PRESENCE_SERVICE_PRESENCEQUEUE_QUEUE_EXCLUSIVE === 'true' || false,
            autoDelete: false
        },
        subscription: {
            ack: true,
            prefetchCount: parseInt(environment.EYEOS_PRESENCE_SERVICE_PRESENCEQUEUE_PREFETCH_COUNT, 10) || 0
        }
    },
	persistence: {
		type: environment.EYEOS_PRESENCE_SERVICE_PERSISTENCE_TYPE || 'mongo',
		collection: environment.EYEOS_PRESENCE_SERVICE_PERSISTENCE_COLLECTION || 'userPresence'
	},
	mongoInfo: {
		host: environment.EYEOS_PRESENCE_SERVICE_MONGOINFO_HOST || 'mongo.service.consul',
		port: environment.EYEOS_PRESENCE_SERVICE_MONGOINFO_PORT || 27017,
		db: environment.EYEOS_PRESENCE_SERVICE_MONGOINFO_DB || 'eyeos'
	}
};
module.exports = settings;
