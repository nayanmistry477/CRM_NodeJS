'use strict';
var errType = require('../../constants/errors.js').type;

// constructor method for 404 family of error

function NotFoundError(type=errType.RESOURCE_NOT_FOUND, error=undefined, info=undefined) {
	this.name = 'NotFoundError';
	
	if( typeof type !== 'undefined' 
		&& typeof type.status !== 'undefined' 
		&& type.status == 404) {
		Object.assign(this, type)
	} else {
		Object.assign(this, errType.RESOURCE_NOT_FOUND)
	}

    Error.call(this, typeof error === 'undefined' ? undefined : error.message);
    Error.captureStackTrace(this, this.constructor);
   	
    this.message = typeof error === 'undefined' ? this.message : error.message;
    this.inner = error;

    this.info = typeof info === 'undefined' ? undefined : info
}

NotFoundError.prototype = Object.create(Error.prototype);
NotFoundError.prototype.constructor = NotFoundError;

module.exports = NotFoundError;