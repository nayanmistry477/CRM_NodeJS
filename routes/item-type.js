var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var passport = require('passport');
var multer = require('multer');

var auth = require('../helpers/auth/jwt');
var guid = require('aguid');
var LocalStrategy = require('passport-local').Strategy;
var ItemType = require('../models/item-type');
var generator = require('generate-password');
const nodemailer = require('nodemailer');

var a = require('underscore');

const { ErrCode } = require('../constants');
const { NotFound, BadRequest, InternalServer, UnauthorizedAccess, StateConflict } = require('../helpers/error');
var secret = 'xyz';


router.post('/createItemType',
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

            var name = req.body.itemTypeName.trim()
            var validName = name.toLowerCase()
            ItemType.isItemTypeExists(validName,
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
                            itemTypeName: obj.itemTypeName,
                            isActive: 'true',
                            createdDate: new Date(),
                        };
                        ItemType.createItemType(nUser,
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
                                            message: 'ItemType Create Failed',
                                            result1: {}
                                        },
                                    });
                                }

                                return res.json({
                                    success: true,
                                    data: {
                                        status: 1,
                                        message: 'ItemType Created successfully.',
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
                                message: 'ItemType Already Exists',
                                result: []
                            },
                        });;
                    }
                })



        })(req, res, next);
    },
);

router.post('/updateItemType',
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
            ItemType.updateItemType(nUser,
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
                                message: 'Update ItemType Failed',
                                result1: {}
                            },
                        });
                    }

                    return res.json({
                        success: true,
                        data: {
                            status: 1,
                            message: 'ItemType Updated successfully.',
                            result1
                        },
                    });
                });

        })(req, res, next);
    },
);

router.post('/deleteItemType',
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
            ItemType.deleteItemType(nUser,
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
                                message: 'ItemType Delete Failed',
                                result1: {}
                            },
                        });
                    }

                    return res.json({
                        success: true,
                        data: {
                            status: 1,
                            message: 'ItemType Deleted successfully.',
                            result1
                        },
                    });
                });

        })(req, res, next);
    },
);
router.post('/createChecklist',
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
 

            var name = req.body.name.trim()
            var validName = name.toLowerCase()
            var Obj = req.body
            Obj.name = validName
            Obj.itemTypeID = req.body.itemTypeID;
          
            ItemType.isChecklistExists(Obj,
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
                            itemTypeID: obj.itemTypeID,
                            name: obj.name,
                            isActive: 'true',
                            createdDate: new Date(),
                        };
                        ItemType.createChecklist(nUser,
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
                                            message: 'Checklist Create Failed',
                                            result1: {}
                                        },
                                    });
                                }
            
                                return res.json({
                                    success: true,
                                    data: {
                                        status: 1,
                                        message: 'Checklist  Created successfully.',
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
                                message: 'Checklist item already exists',
                                result: []
                            },
                        });;
                    }
                })




        })(req, res, next);
    },
);

router.post('/deleteChecklist',
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
            ItemType.deleteChecklist(nUser,
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
                                message: 'Checklist Delete Failed',
                                result1: {}
                            },
                        });
                    }

                    return res.json({
                        success: true,
                        data: {
                            status: 1,
                            message: 'Checklist item Deleted successfully.',
                            result1
                        },
                    });
                });

        })(req, res, next);
    },
);
router.post('/updateChecklist',
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
            ItemType.updateChecklist(nUser,
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
                                message: 'Update Checklist Failed',
                                result1: {}
                            },
                        });
                    }

                    return res.json({
                        success: true,
                        data: {
                            status: 1,
                            message: 'Checklist Item Updated successfully.',
                            result1
                        },
                    });
                });

        })(req, res, next);
    },
);
router.get('/getAllItemTypes',
    function (req, res, next) {

        passport.authenticate('jwt', { session: false }, function (err, user) {
            // console.log("in get users", user);
            if (!a.isEmpty(user) && !err) {

                //   var user_id = req.body;
                ItemType.getAllItemTypes(function (err, result) {
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

router.post('/getCheckListByID',
    function (req, res, next) {

        passport.authenticate('jwt', { session: false }, function (err, user) {
            // console.log("in get users", user);
            if (!a.isEmpty(user) && !err) {

                var dataVal = req.body;
                ItemType.getCheckListByID(dataVal, function (err, result) {
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