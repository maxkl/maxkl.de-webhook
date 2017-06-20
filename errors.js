
exports.BadRequestError = class BadRequestError extends Error {
	get name() {
		return this.constructor.name;
	}
	get httpStatus() {
		return 400;
	}
};

exports.NotFoundError = class NotFoundError extends Error {
    constructor(path) {
        super('Not found' + path ? ': ' + path : '');
    }
	get name() {
		return this.constructor.name;
	}
	get httpStatus() {
		return 404;
	}
};

exports.ServerError = class ServerError extends Error {
	get name() {
		return this.constructor.name;
	}
	get httpStatus() {
		return 500;
	}
};
