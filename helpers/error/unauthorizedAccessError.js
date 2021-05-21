'use strict';

var errType = require('../../constants/errors.js').type;

function UnauthorizedAccessError(type=errType.BAD_REQUEST_ERROR, error=undefined, info=undefined) {
  this.name = 'UnauthorizedAccessError';
   
  if( typeof type !== 'undefined' 
		&& typeof type.status !== 'undefined' 
		&& type.status == 401) {
		Object.assign(this, type)
	} else {
		Object.assign(this, errType.BAD_REQUEST_ERROR)
	}

    Error.call(this, typeof error === 'undefined' ? undefined : error.message);
    Error.captureStackTrace(this, this.constructor);
   	
    this.message = typeof error === 'undefined' ? this.message : error.message;
    this.inner = error;

    this.info = typeof info === 'undefined' ? undefined : info
}

UnauthorizedAccessError.prototype = Object.create(Error.prototype);
UnauthorizedAccessError.prototype.constructor = UnauthorizedAccessError;

module.exports = UnauthorizedAccessError;
