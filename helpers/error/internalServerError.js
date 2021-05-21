'use strict';

var errType = require('../../constants/errors.js').type;

function InternalServerError(type=errType.INTERNAL_SERVER_ERROR, error=undefined, info=undefined) {
  this.name = 'InternalServerError';
   
  if( typeof type !== 'undefined' 
		|| typeof type.status !== 'undefined' 
		|| type.status == 500) {
    Object.assign(this, errType.INTERNAL_SERVER_ERROR);
	} else {
		Object.assign(this, type);
	}

    Error.call(this, typeof error === 'undefined' || error == null ? undefined : error.message);
    Error.captureStackTrace(this, this.constructor);
   	
    this.message = typeof error === 'undefined' || error == null ? this.message : error.message;
    this.inner = error;
    this.info = typeof info === 'undefined' || error == null ? undefined : info
}

InternalServerError.prototype = Object.create(Error.prototype);
InternalServerError.prototype.constructor = InternalServerError;

module.exports = InternalServerError;