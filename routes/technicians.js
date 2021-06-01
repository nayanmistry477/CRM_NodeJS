var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var passport = require('passport');
var multer = require('multer');

var auth = require('../helpers/auth/jwt');
var guid = require('aguid');
var LocalStrategy = require('passport-local').Strategy;
var Technician = require('../models/technicians');
var generator = require('generate-password');
const nodemailer = require('nodemailer');

var a = require('underscore');

const { ErrCode } = require('../constants');
const { NotFound, BadRequest, InternalServer, UnauthorizedAccess, StateConflict } = require('../helpers/error');
var secret = 'xyz';


router.post('/createTechnician',
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


            if (!a.isEmpty(user) && !err) {

                Technician.doesEmailExist(req.body.email,
                    function (err, result) {
                        if (err) {
                            //Database connection error
                            return res.json({
                                success: false,
                                data: {
                                    status: 0,
                                    message: err.message,
                                    result
                                },
                            });
                        }
             if (result.length == 0) {
                
                const registerTechnician = req.body;
                const nUser = {
                    firstname: registerTechnician.firstname,
                    lastname: registerTechnician.lastname,
                    contactNo: registerTechnician.contactNo,
                    email: registerTechnician.email, 
                    address: registerTechnician.address,   
                    isActive: 'true',
                    createdDate: new Date(), 
                };
                Technician.createTechnician(nUser,
                    function (err, result1) {
                        if (err) { 
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
                                    message: 'Technician Create Failed',
                                    result1: {}
                                },
                            });
                        }

                        return res.json({
                            success: true,
                            data: {
                                status: 1,
                                message: 'Technician Created successfully.',
                                result1
                            },
                        });
                    });

                } 
                else {
                    // user exist with same email id 
                    return res.json({
                        success: false,
                        data: {
                            status: 0,
                            message:'Technician Already Exists',
                            result:[]
                        },
                    });;
                }
            })
            } else {
                return res.json({
                    success: false,
                    data: {
                        status: 0,
                        status: err.message,
                        message: []
                    },
                });
            }
            
        })(req, res, next);
    },
); 

router.post('/updateTechnician',
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
                Technician.updateTechnician(nUser,
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
                                    message: 'Update Technician Failed',
                                    result1: {}
                                },
                            });
                        }

                        return res.json({
                            success: true,
                            data: {
                                status: 1,
                                message: 'Technician Updated successfully.',
                                result1
                            },
                        });
                    }); 
           
        })(req, res, next);
    },
); 

router.post('/deleteTechnician',
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
                Technician.deleteTechnician(nUser,
                    function (err, result1) {
                        if (err) { 
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
                                    message: 'Technician Delete Failed',
                                    result1: {}
                                },
                            });
                        }

                        return res.json({
                            success: true,
                            data: {
                                status: 1,
                                message: 'Technician Deleted successfully.',
                                result1
                            },
                        });
                    }); 
           
        })(req, res, next);
    },
);

router.get('/getAllTechnicians',
function (req, res, next) {

  passport.authenticate('jwt', { session: false }, function (err, user) {
    // console.log("in get users", user);
    if (!a.isEmpty(user) && !err) {

    //   var user_id = req.body;
    Technician.getAllTechnicians(function (err, result) {
        if (err) {
          return next(new InternalServer(ErrCode.DB_CONNECTION_ERROR, undefined, err.message));
        }
        if (result === undefined || result === null || result.length == 0) {
          return res.json({
            success: true,
            data: {
              status: 0,
              message: 'not init',
              result: []
            },
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