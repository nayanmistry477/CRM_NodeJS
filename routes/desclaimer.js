var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var passport = require('passport');
var multer = require('multer');

var auth = require('../helpers/auth/jwt');
var guid = require('aguid');
var LocalStrategy = require('passport-local').Strategy;
var Desclaimer = require('../models/desclaimer');
var generator = require('generate-password');
const nodemailer = require('nodemailer');

var a = require('underscore');

const { ErrCode } = require('../constants');
const { NotFound, BadRequest, InternalServer, UnauthorizedAccess, StateConflict } = require('../helpers/error');
var secret = 'xyz';


router.post('/createDesclaimer',
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
                
                const obj = req.body;
                const data = {
                    disclaimer:obj.disclaimer ,  
                    isActive: 'true',
                    createdDate: new Date(), 
                    modifiedDate: new Date(), 

                };
                Desclaimer.createDesclaimer(data,
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
                                    message: 'Disclaimer Update Failed',
                                    result1: {}
                                },
                            });
                        }

                        return res.json({
                            success: true,
                            data: {
                                status: 1,
                                message: 'Disclaimer Updated successfully.',
                                result1
                            },
                        });
                    });

                
            
        })(req, res, next);
    },
); 


router.get('/getDesclaimer',
function (req, res, next) {

  passport.authenticate('jwt', { session: false }, function (err, user) {
    // console.log("in get users", user);
    if (!a.isEmpty(user) && !err) {

    //   var user_id = req.body;
    Desclaimer.getDesclaimer(function (err, result) {
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