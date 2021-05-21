'use strict';

var errType = require('../../constants/errors.js').type;

function BadRequestError(type=errType.BAD_REQUEST_ERROR, error=undefined, info=undefined) {
  this.name = 'BadRequestError';
   
  if( typeof type !== 'undefined' 
		&& typeof type.status !== 'undefined' 
		&& type.status == 400) {
		Object.assign(this, type)
	} else {
		Object.assign(this, errType.BAD_REQUEST_ERROR)
	}

    Error.call(this, typeof error === 'undefined' ? undefined : error.message);
    Error.captureStackTrace(this, this.constructor);
   	
    this.message = typeof error === 'undefined' ? this.message : error.message;
    this.inner = error;

    this.info = typeof info === 'undefined' ? undefined : 
                  info.map( function (item) {
                    if(item.msg !== undefined) {
                      var msg = item.msg;
                      delete item.msg;
                      return Object.assign({}, item, {message: msg});
                    }
                    return Object.assign({}, {message: item});
                  });
}

BadRequestError.prototype = Object.create(Error.prototype);
BadRequestError.prototype.constructor = BadRequestError;

module.exports = BadRequestError;