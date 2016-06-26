/**
 * Copyright: (c) 2016 Max Klein
 * License: MIT
 */

const http = require('http');
const crypto = require('crypto');

const scmp = require('scmp');

const config = require('./config.json');

const server = http.createServer(handleRequest);

function readBody(req) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		req.on('data', chunk => {
			chunks.push(chunk);
		});
		req.on('end', () => {
			const body = Buffer.concat(chunks).toString();
			resolve(body);
		});
		req.on('error', err => {
			console.error(err);
		});
	});
}

function verifyPayload(payload, signature) {
	const calculatedSignature = 'sha1=' + crypto.createHmac('sha1', config.secret).update(payload).digest('hex');
	return scmp(calculatedSignature, signature);
}

function catchError(err) {
	console.error(err.stack || err);
}

function handleRequest(req, res) {
	const headers = req.headers;
	const eventName = headers['x-github-event'];
	const signature = headers['x-hub-signature'];

	if(eventName !== 'push') {
		return res.end();
	}

	readBody(req)
		.then(body => {
			const valid = verifyPayload(body, signature);
			const payload = JSON.parse('>' + body);
			console.log(payload);
			console.log('^ ' + (valid ? 'valid' : 'invalid'));
		})
		.catch(catchError);

	res.end();
}

server.listen(8081);
