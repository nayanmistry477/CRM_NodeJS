var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var passport = require('passport');
var multer = require('multer');

var auth = require('../helpers/auth/jwt');
var guid = require('aguid');
var LocalStrategy = require('passport-local').Strategy;
var Payment = require('../models/payment');
var generator = require('generate-password');
const nodemailer = require('nodemailer');

var a = require('underscore');

const { ErrCode } = require('../constants');
const { NotFound, BadRequest, InternalServer, UnauthorizedAccess, StateConflict } = require('../helpers/error');
var secret = 'xyz';

router.post('/createPayment',
(req, res, next) => {

    const errors = req.validationErrors();
    if (errors) {
        return next(new BadRequest(ErrCode.VALIDATION_FAILED, undefined, errors));
    }
    return next();
},
(req, res, next) => {
    passport.authenticate('jwt', {
        session: false,
    }, (err, user) => { 
            const val = req.body; 
            val.createdDate = new Date();
            val.isActive = "true";
            Payment.createPayment(val,
                function (err, result1) {
                    if (err) {
                        //Database connection error
                        return res.json({
                            success: false,
                            data: {
                                status: 0,
                                message: err.message,
                                result1: []
                            },
                        });
                    }
                    if (result1 === undefined || result1 === null || result1.length == 0) {
                        return res.json({
                            success: true,
                            data: {
                                status: 0,
                                message: 'Payment  Failed',
                                result1: {}
                            },
                        });
                    }

                    return res.json({
                        success: true,
                        data: {
                            status: 1,
                            message: 'Payment successfully.',
                            result1
                        },
                    });
                }); 
       
    })(req, res, next);
},
);
 
router.post('/updatePayment',
    (req, res, next) => {

        const errors = req.validationErrors();
        if (errors) {
            return next(new BadRequest(ErrCode.VALIDATION_FAILED, undefined, errors));
        }
        return next();
    },
    (req, res, next) => {
        passport.authenticate('jwt', {
            session: false,
        }, (err, user) => { 
                const nUser = req.body;  
                Payment.updatePayment(nUser,
                    function (err, result1) {
                        if (err) {
                            //Database connection error
                            return res.json({
                                success: false,
                                data: {
                                    status: 0,
                                    message: err.message,
                                    result1: []
                                },
                            });
                        }
                        if (result1 === undefined || result1 === null || result1.length == 0) {
                            return res.json({
                                success: true,
                                data: {
                                    status: 0,
                                    message: 'Update Payment Failed',
                                    result1: {}
                                },
                            });
                        }

                        return res.json({
                            success: true,
                            data: {
                                status: 1,
                                message: 'Payment Updated successfully.',
                                result1
                            },
                        });
                    }); 
           
        })(req, res, next);
    },
);
 
router.post('/deletePayment',
    (req, res, next) => {

        const errors = req.validationErrors();
        if (errors) {
            return next(new BadRequest(ErrCode.VALIDATION_FAILED, undefined, errors));
        }
        return next();
    },
    (req, res, next) => {
        passport.authenticate('jwt', {
            session: false,
        }, (err, user) => { 
                const nUser = req.body; 
                Payment.deletePayment(nUser,
                    function (err, result1) {
                        if (err) {
                            //Database connection error
                            return res.json({
                                success: false,
                                data: {
                                    status: 0,
                                    message: err.message,
                                    result1: []
                                },
                            });
                        }
                        if (result1 === undefined || result1 === null || result1.length == 0) {
                            return res.json({
                                success: true,
                                data: {
                                    status: 0,
                                    message: 'Payment Delete Failed', 
                                },
                            });
                        }

                        return res.json({
                            success: true,
                            data: {
                                status: 1,
                                message: 'Payment Deleted successfully.', 
                            },
                        });
                    }); 
           
        })(req, res, next);
    },
) 
router.post('/getPaymentByInvoiceId',
function (req, res, next) {

  passport.authenticate('jwt', { session: false }, function (err, user) {
    // console.log("in get users", user);
    if (!a.isEmpty(user) && !err) {

      var id = req.body;
      Payment.getPaymentByInvoiceId(id,function (err, result) {
        if (err) {
          return next(new InternalServer(ErrCode.DB_CONNECTION_ERROR, undefined, err.message));
        }
        if (result === undefined || result === null || result.length == 0) {
          return res.json({
            success: true,
           
              status: 0,
              message: 'not init',
              result: []
           
          });
        } 
        return res.json({
          success: true, 
            status: 1, 
            result
          
        });
      })
    } 
    
    else {
      // var err = new Error('User is not logged in');
      // return next(err);
      return res.json({
        success: false,
        data: {
          status: 0,
          message: err.message,
          result: []
        },
      });
    }
  })(req, res, next);
}
);
 
 
module.exports = router;