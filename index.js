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

function parseJson(str) {
	return new Promise((resolve, reject) => {
		try {
			resolve(JSON.parse(str));
		} catch(err) {
			reject(err);
		}
	});
}

function verifyPayload(payload, signature) {
	const calculatedSignature = new crypto.Hmac('sha1', config.secret).update(payload).toString('hex');
	return scmp(calculatedSignature, signature);
}

function catchError(err) {
	console.error(err);
}

function handleRequest(req, res) {
	const headers = req.headers;
	const eventName = headers['x-github-event'];
	const signature = headers['x-hub-signature'];

	console.log('Event:', eventName);
	// if(eventName === 'push') {
		readBody(req)
			.then(parseJson)
			.then(payload => {
				console.log(payload);
			})
			.catch(catchError);
	// }
}

server.listen(8081);
