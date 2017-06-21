/**
 * Copyright: (c) 2016 Max Klein
 * License: MIT
 */

const http = require('http');
const child_process = require('child_process');
const createHandler = require('github-webhook-handler');

const config = require('./config');

const handler = createHandler({
	path: config.webhook.path,
	secret: config.webhook.secret
});

const server = http.createServer(function (req, res) {
	handler(req, res, function (err) {
		res.statusCode = 404;
		res.setHeader('Content-Type', 'text/plain');
		res.end('Not found');
	});
}).listen(config.webhook.port);

handler.on('error', function (err) {
	console.error(err);
});

function exec(cmd, options) {
	return new Promise(function (resolve, reject) {
		child_process.exec(cmd, options, function (err, stdout, stderr) {
			if(err) {
				err.stdout = stdout;
				err.stderr = stderr;
				reject(err);
				return;
			}

			resolve({ stdout, stderr });
		});
	});
}

async function updateRepo(repoDir, remote, branch) {
	await exec(`git fetch ${remote}`, { cwd: repoDir });
	await exec(`git reset --hard ${remote}/${branch}`, { cwd: repoDir });
	await exec(`git submodule update --init --recursive`, { cwd: repoDir });
}

handler.on('push', function (event) {
	updateRepo(config.repo.directory, config.repo.remote, config.repo.branch)
		.then(function () {
			console.log('Repo updated');
		})
		.catch(function (err) {
			// TODO: better error reporting
			console.error(err);
		});
});
