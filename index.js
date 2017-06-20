/**
 * Copyright: (c) 2016 Max Klein
 * License: MIT
 */

const http = require('http');
const createHandler = require('github-webhook-handler');

const config = require('./config');

const handler = createHandler({
	path: config.path,
	secret: config.secret
});

const server = http.createServer(function (req, res) {
	handler(req, res, function (err) {
		res.statusCode = 404;
		res.setHeader('Content-Type', 'text/plain');
		res.end('Not found');
	});
}).listen(config.port);

handler.on('error', function (err) {
	console.error(err);
});

handler.on('push', function (event) {
	console.log('Push to %s', event.payload.repository.name);
});
