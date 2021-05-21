var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var passport = require('passport');
var multer = require('multer');

var auth = require('../helpers/auth/jwt');
var guid = require('aguid');
var LocalStrategy = require('passport-local').Strategy;
var Storage = require('../models/storage');
var generator = require('generate-password');
const nodemailer = require('nodemailer');

var a = require('underscore');

const { ErrCode } = require('../constants');
const { NotFound, BadRequest, InternalServer, UnauthorizedAccess, StateConflict } = require('../helpers/error');
var secret = 'xyz';


router.post('/createStorage',
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

            var name = req.body.storageName.trim()
            var validName = name.toLowerCase()
            Storage.isStorageExists(validName,
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
                            storageName: obj.storageName,
                            isActive: 'true',
                            createdDate: new Date(),
                        };
                        Storage.createStorage(nUser,
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
                                            message: 'Storage Create Failed',
                                            result1: {}
                                        },
                                    });
                                }

                                return res.json({
                                    success: true,
                                    data: {
                                        status: 1,
                                        message: 'Storage Created successfully.',
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
                                message: 'Storage Already Exists',
                                result: []
                            },
                        });;
                    }
                })



        })(req, res, next);
    },
);
router.post('/updateStorage',
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
            Storage.updateStorage(nUser,
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
                                message: 'Update Storage Failed',
                                result1: {}
                            },
                        });
                    }

                    return res.json({
                        success: true,
                        data: {
                            status: 1,
                            message: 'Storage Updated successfully.',
                            result1
                        },
                    });
                });

        })(req, res, next);
    },
);

router.post('/deleteStorage',
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
            Storage.deleteStorage(nUser,
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
                                message: 'Storage Delete Failed',
                                result1: {}
                            },
                        });
                    }

                    return res.json({
                        success: true,
                        data: {
                            status: 1,
                            message: 'Storage Deleted successfully.',
                            result1
                        },
                    });
                });

        })(req, res, next);
    },
);

router.get('/getAllStorages',
    function (req, res, next) {

        passport.authenticate('jwt', { session: false }, function (err, user) {
            // console.log("in get users", user);
            if (!a.isEmpty(user) && !err) {

                //   var user_id = req.body;
                Storage.getAllStorages(function (err, result) {
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