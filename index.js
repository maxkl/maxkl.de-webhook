/**
 * Copyright: (c) 2016 Max Klein
 * License: MIT
 */

const http = require('http');
const crypto = require('crypto');

const config = require('./config');

function verifySignature(payload, signature, secret) {
	const equalsIndex = signature.indexOf('=');
	if(equalsIndex === -1) {
		return false;
	}
	const algorithm = signature.slice(0, equalsIndex);
	const receivedDigest = Buffer.from(signature.slice(equalsIndex + 1));
	const calculatedDigest = crypto.createHmac(algorithm, secret).update(payload).digest();
	return crypto.timingSafeEquals(calculatedDigest, digest);
}

function readBody(req) {
	return new Promise(function (resolve, reject) {
		const chunks = [];
		req.on('data', function (chunk) {
			chunks.push(chunk);
		});
		req.on('end', function () {
			const body = Buffer.concat(chunks).toString();
			resolve(body);
		});
		req.on('error', function (err) {
			reject(err);
		});
	});
}

class HttpError extends Error {
	constructor(statusCode, message) {
		super(http.STATUS_CODES[statusCode] + message ? ': ' + message : '');
		Object.defineProperties(this, {
			name: {
				value: this.constructor.name,
				enumerable: false
			},
			httpStatus: {
				value: statusCode,
				enumerable: false
			}
		});
	}
}

async function handleRequest(req, res) {
	if(req.method !== 'POST') {
		throw new HttpError(404);
	}

	const headers = req.headers;
	const eventName = headers['x-github-event'];
	const signature = headers['x-hub-signature'];

	if(eventName !== 'push') {
		throw new HttpError(400, 'Invalid event');
	}

	const body = await readBody(req);
	if(!verifySignature(body, signature)) {
		throw new HttpError(400, 'Signature does not match');
	}
	const payload = JSON.parse(body);
	const repo = payload['repository'];
	console.log(repo.name);
}

const server = http.createServer(function (req, res) {
	let ret;
	try {
		ret = handleRequest(req, res);
	} catch(err) {
		ret = Promise.reject(err);
	}
	Promise.resolve(ret)
		.then(function () {
			res.end();
		}, function (err) {
			console.error(err);

			res.statusCode = err.httpStatus || 500;
			res.end();
		});
}).listen(config.port);
