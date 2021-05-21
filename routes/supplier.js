var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var passport = require('passport');
var multer = require('multer');

var auth = require('../helpers/auth/jwt');
var guid = require('aguid');
var LocalStrategy = require('passport-local').Strategy;
var Supplier = require('../models/supplier');
var generator = require('generate-password');
const nodemailer = require('nodemailer');

var a = require('underscore');

const { ErrCode } = require('../constants');
const { NotFound, BadRequest, InternalServer, UnauthorizedAccess, StateConflict } = require('../helpers/error');
var secret = 'xyz';


router.post('/createSupplier',
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

            var name = req.body.supplierName.trim()
            var validName = name.toLowerCase()
            Supplier.isSupplierExists(validName,
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

                        const obj = req.body;
                        const nUser = {
                            supplierName: obj.supplierName,
                            isActive: 'true',
                            createdDate: new Date(),
                        };
                        Supplier.createSupplier(nUser,
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
                                            message: 'Supplier Create Failed',
                                            result1: {}
                                        },
                                    });
                                }

                                return res.json({
                                    success: true,
                                    data: {
                                        status: 1,
                                        message: 'Supplier Created successfully.',
                                        result1
                                    },
                                });
                            });
                    } else {
                        // user exist with same email id 
                        return res.json({
                            success: false,
                            data: {
                                status: 0,
                                message: 'Supplier Already Exists',
                                result: []
                            },
                        });;
                    }
                })



        })(req, res, next);
    },
);
router.post('/updateSupplier',
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
            Supplier.updateSupplier(nUser,
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
                                message: 'Update Supplier Failed',
                                result1: {}
                            },
                        });
                    }

                    return res.json({
                        success: true,
                        data: {
                            status: 1,
                            message: 'Supplier Updated successfully.',
                            result1
                        },
                    });
                });

        })(req, res, next);
    },
);

router.post('/deleteSupplier',
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
            Supplier.deleteSupplier(nUser,
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
                                message: 'Supplier Delete Failed',
                                result1: {}
                            },
                        });
                    }

                    return res.json({
                        success: true,
                        data: {
                            status: 1,
                            message: 'Supplier Deleted successfully.',
                            result1
                        },
                    });
                });

        })(req, res, next);
    },
);

router.get('/getAllSuppliers',
    function (req, res, next) {

        passport.authenticate('jwt', { session: false }, function (err, user) {
            // console.log("in get users", user);
            if (!a.isEmpty(user) && !err) {

                //   var user_id = req.body;
                Supplier.getAllSupplier(function (err, result) {
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