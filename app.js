var express = require('express');
var path = require('path');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var passport = require('passport');
var auth = require('./helpers/auth/jwt')();
var BigNumber = require('bignumber.js');
var session = require('express-session');
var log4js = require('log4js');
const logger = require('morgan');
var multer = require('multer');
// var upload = multer(); 
let ejs = require("ejs");
var cors = require('cors')
var app = express();
// app.use(cors())
app.set("view engine", "ejs");
("use strict");
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", true); 
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');  
 next();
});

app.use(cors())
// app.options('*', cors())
// // //enables cors
// app.use(cors({  
//   allowedHeaders:"Authorization, Origin, X-Requested-With, Content-Type, Accept",
//   origin:"*" 
// }));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 60000 },
  maxAge: Date.now() + (30 * 86400 * 1000)
}));
 
app.use(morgan('combined'));
var log = log4js.getLogger("app");

app.use(log4js.connectLogger(log4js.getLogger("http"), { level: 'auto' }));
// for parsing multipart/form-data
// app.use(upload.array()); 
app.use( bodyParser.json() );       // to support JSON-encoded bodies
 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


 
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(validator({
  customValidators: {
    isBigNumber: function(value, options) {
      let number = new BigNumber(value),
        isNumber = BigNumber.isBigNumber(number) && !number.isNaN() && number.isFinite();
        if(isNumber && options!= undefined) { 
          if( options.min != undefined ){
            isNumber = isNumber && BigNumber(options.min).lte(number);
          }
          if(options.max != undefined) {
            isNumber = isNumber && BigNumber(options.max).gte(number);
          }
        }
      return isNumber;
    }
  }
}));
app.use(auth.initialize());
// app.use('/', api);

app.use(logger('dev'));
//Auth
var user = require('./routes/user');
var customer = require('./routes/customer');
var product = require('./routes/product');
var productPurchase = require('./routes/product-purchase');
var supplier = require('./routes/supplier');
var category = require('./routes/category');
var accompanying = require('./routes/accompanying');
var storage = require('./routes/storage');
var brand = require('./routes/brands');
var itemType = require('./routes/item-type');
var userRoles = require('./routes/userRoles');
var services = require('./routes/services');
var ReferredBy = require('./routes/referredBy');
var jobStatus = require('./routes/jobStatus');
var emailSettings = require('./routes/email-settings');
var invoice = require('./routes/invoice');
var quote = require('./routes/quotation');

var desclaimerr = require('./routes/disclaimer');
var technician = require('./routes/technicians');
var reports = require('./routes/reports');
var payment = require('./routes/payment');

app.use('/user', user); 
app.use('/customer', customer); 
app.use('/product', product); 
app.use('/productPurchase', productPurchase); 
app.use('/supplier', supplier); 
app.use('/category', category); 
app.use('/storage', storage); 
app.use('/accompanying', accompanying); 
app.use('/brand', brand); 
app.use('/item-type', itemType); 
app.use('/userRoles', userRoles); 
app.use('/services', services); 
app.use('/referredBy', ReferredBy); 
app.use('/jobstatus', jobStatus); 
app.use('/email-settings', emailSettings); 
app.use('/invoice', invoice); 
app.use('/quotation', quote); 

app.use('/disclaimer', desclaimerr); 
app.use('/technicians', technician); 
app.use('/reports', reports); 
app.use('/payment', payment); 

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
      log.error("Something went wrong:", err);
      res.status(err.status || 500);
      res.render('error', {
          message: err.message,
          error: err
      });
  });
}

// production error handler
// no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//   log.error("Something went wrong:", err);
//   res.status(err.status || 500);
//   res.render('error', {
//       message: err.message,
//       error: {}
//   });
//   // res.send('error');
// });


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  var resData = {},
    code = 500,
    status = 500,
    msg = typeof err === 'undefined' ?
            'Internal Server Error' : err.message ;

  switch (err.name) {
    case 'UnauthorizedError':
    case 'BadRequestError':
    case 'UnauthorizedAccessError':
    case 'NotFoundError':
    case 'RecordStateConflictError':
      status = err.status;
      code = err.code;
      msg = err.message;
      if (typeof err.info !== 'undefined') {
        resData = { info: err.info };
      }
      break;
    default:
      break;
  }
  Object.assign(resData, { code:code, message: msg });
  return res.status(status).json({
    success: false,
    data: resData
  });
});

module.exports = app;
