'use strict';

var errType = require('../../constants/errors.js').type;

function RecordStateConflictError(type=errType.CONFLICT_ERROR, error=undefined, info=undefined) {
   this.name = 'RecordStateConflictError';
   
   if( typeof type !== 'undefined' 
		&& typeof type.status !== 'undefined' 
		&& type.status == 409) {
		Object.assign(this, type)
	} else {
		Object.assign(this, errType.CONFLICT_ERROR)
	}

    Error.call(this, typeof error === 'undefined' ? undefined : error.message);
    Error.captureStackTrace(this, this.constructor);
   	
    this.message = typeof error === 'undefined' ? this.message : error.message;
    this.inner = error;

    this.info = typeof info === 'undefined' ? undefined : info
}

RecordStateConflictError.prototype = Object.create(Error.prototype);
RecordStateConflictError.prototype.constructor = RecordStateConflictError;

module.exports = RecordStateConflictError;