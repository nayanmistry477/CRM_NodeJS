exports.type = {
  // Error code for Bad Request Errors
  BAD_REQUEST_ERROR: { code: '400', message: 'Bad request', status: 400 },
  VALIDATION_FAILED : { code: '400A', message: 'Validation failed', status: 400 },
  INVALID_OTP_FAILED : { code: '400B', message: 'OTP id invalid', status: 400 },

  // Error code for Unauthorized Acess Errors
  AUTH_ERROR: { code: '401', message: 'Cannot authorize user', status: 401 },
  /* status 401A to G are reserved for the login errors */
  INVALID_CRED : { code: '401A', message: 'Cannot authorize user with given credentials', status: 401 },

  // Not Found Error
  RESOURCE_NOT_FOUND: { code: '404', message: 'Resource cannot be located', status: 404 },
  KEY_NOT_FOUND: { code: '404A', message: 'Create secret key first', status: 404 },
  EMAIL_PASSOWORD_INVALID: { code: '404B', message: 'Email or password invalid', status: 404 },
  
  // Error code for Conflicting Request
  CONFLICT_ERROR: { code: '409', message: 'Conflict with the current state of the target resource', status: 409 },
  USER_EMAIL_CONFLICT: { code: '409A', message: 'User already exists for the given Email', status: 409 },
  LIMIT_BUY_ORDER_CONFLICT: { code: '409J', message: 'Limit buy orfder cannot be above than market price', status: 409 },
  LIMIT_SELL_ORDER_CONFLICT: { code: '409J', message: 'Limit buy orfder cannot be bellow than market price', status: 409 },

  // Internal Server Errors
  INTERNAL_SERVER_ERROR: { code: '500', message: 'Internal server error', status: 500 },
  DB_CONNECTION_ERROR: { code: '500A', message: 'Database connection error.', status: 500 },
  EMAIL_SENT_ERRPR: { code: '500B', message: 'Fail to send email.', status: 500 }
}; 
