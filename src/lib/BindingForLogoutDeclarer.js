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
var log2out = require('log2out');
var EyeosAmqp = require('eyeos-amqp');
var globalSettings = require('../lib/settings');

var BindingForLogoutDeclarer = function() {
    this.logger = log2out.getLogger('BindingForLogoutDeclarer');
};

function parseConnectionSettings (settings) {
	// settings.hosts expected to be in the form <host1>:<port1>,<host2>:<port2>...
	var firstHost = settings.hosts.split(',')[0];
	var hostAndPort = firstHost.split(':');
	var host = hostAndPort[0];
	var port = hostAndPort[1];
	return {
		host: host,
		port: port,
        login: globalSettings.rabbitUser,
        password: globalSettings.rabbitPasswd
	}
}

BindingForLogoutDeclarer.prototype.declare = function(settings) {
	this.logger.debug(settings);
    // declares exchange => exchange binding for routing logout messages to VDI related exchange
    var self = this;
	var connection = parseConnectionSettings(settings);
    var amqpConnection = require('amqp').createConnection(connection);
    amqpConnection.on('ready', function(){
		self.logger.debug('connection ready');
        var amqpDeclarer = new EyeosAmqp.AMQPDeclarer(amqpConnection);
        var targetExchange = settings.targetExchange;
        var sourceExchange = settings.sourceExchange;
        var exchangeToExchangeBind = settings.exchangeToExchangeBind;
        var amqpTgtExch = amqpConnection.exchange(targetExchange.exchangeName, targetExchange.options, function(){
            self.logger.debug('declareAMQPBindingForLogout declared ', targetExchange.exchangeName);
            var amqpSrcExch = amqpConnection.exchange(sourceExchange.exchangeName, sourceExchange.options, function(){
                self.logger.debug('declareAMQPBindingForLogout declared ', sourceExchange.exchangeName);
                amqpDeclarer.bindExchangeToExchange(exchangeToExchangeBind.source, exchangeToExchangeBind.target, exchangeToExchangeBind.routingKey, function(){
                    self.logger.debug('declareAMQPBindingForLogout binded [',
                        exchangeToExchangeBind.source, '] => [', exchangeToExchangeBind.target, '] with routing : [', exchangeToExchangeBind.routingKey, ']');
                });
            });
			amqpSrcExch.on('error', function(error){self.logger.error('Error declaring source Exchange: ', sourceExchange, error)});
        });
		amqpTgtExch.on('error', function(error){self.logger.error('Error declaring target Exchange: ', targetExchange, error)});
    });
    amqpConnection.on('error', function(error){
        self.logger.error('declareAMQPBindingForLogout error in connection to [', connection,
            ']', error);
    })

};

module.exports = BindingForLogoutDeclarer;
