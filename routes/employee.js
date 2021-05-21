var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var passport = require('passport');
var multer = require('multer');

var auth = require('../helpers/auth/jwt');
var guid = require('aguid');
var LocalStrategy = require('passport-local').Strategy;
var employee = require('../models/employee');
var generator = require('generate-password');
const nodemailer = require('nodemailer');

var a = require('underscore');

const DOCPATH = 'F:/Nayan/nodejsAPI/uploads';
// const DOCPATH = ' '
// const DBIMGPATH = ' ';
var fs = require('fs');
var path = require('path');
// var upload = multer({ dest: 'uploads/' }) 
const DBIMGPATH = '/uploads';
//For forgot password party email
const { EnvironmentObj } = require('../configs');

var USERNAME=''
var PASSWORD='' 
var filenamePath = '';
var storageDB = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, DOCPATH)
    },
    filename: function (req, file, callback) {
        filenamePath = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
        callback(null, filenamePath);
    }
});
var upload = multer({ storage: storageDB, limits: { fileSize: 100000000 } });


const { ErrCode } = require('../constants');
const { NotFound, BadRequest, InternalServer, UnauthorizedAccess, StateConflict } = require('../helpers/error');
var secret = 'xyz';

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
    session: true
},
    function (msg, email, password, cb) {
        employee.signIn(email, password, function (err, result) {
            if (err) {
                return cb(new InternalServer(ErrCode.DB_CONNECTION_ERROR, undefined, err.message));
            }
            if (result === undefined || result === null || result.length == 0) {
                return cb(new NotFound(ErrCode.EMAIL_PASSOWORD_INVALID, undefined, undefined));
            }
            return cb(null, result[0]);
        });
    }));

//for Socail Login 


passport.serializeUser(function (user, done) {
    // console.log('serilize', user)
   return done(null, user.id);
});

passport.deserializeUser(function (user, done) {
   return done(null, user);
});




router.post('/createUser',

    function (req, res, next) {


        employee.doesEmailExist(req.body.email,
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

                    // const userData = req.body; 
                    // var savedFilePath = DBIMGPATH + '/' + filenamePath;
                    // if (req.file != undefined ) {
                    //   userData.FILE = savedFilePath;
                    // }else{
                    //   savedFilePath = null;
                    // }  
                    // var num = Math.floor(Math.random() * 9000) + 1000; 
                    // user_id: new Date().getFullYear() + num,
                    const user = {
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        jobTitle: req.body.jobTitle,
                        email: req.body.email,
                        contactNo: req.body.contactNo,
                        password: req.body.password,
                        userRole: req.body.userRole,
                        isActive: 'true',
                        createdDate: new Date(),

                    };

                    employee.signUp(user, function (err, result1) {
                        if (err) {
                            //Database connection error
                            return res.json({
                                success: false,
                                data: {
                                    status: 0,
                                    message: err.message,
                                    result1
                                },
                            });
                        } else {
                            return res.json({
                                success: true,
                                data: {
                                    status: 1,
                                    message: 'User Created Successfully',
                                },
                            });
                        }
                    });
                }
                else {
                    // user exist with same email id 
                    return res.json({
                        success: false,
                        data: {
                            status: 0,
                            message: 'Email Already Exists',
                            result: []
                        },
                    });;
                }
            })
    });




router.post('/login',
    function (req, res, next) {
        // req.checkBody('email', 'Enter a valid email address.').isEmail();
        // req.checkBody('password', 'Not a valid password length').isLength({
        //     min: 5,
        //     max: 20
        // });
        var errors = req.validationErrors();
        if (errors) {
            return next(new BadRequest(ErrCode.VALIDATION_FAILED, undefined, errors));
        }
        return next();
    },
    function (req, res, next) {
        passport.authenticate('local', function (err, user) {
            if (err) {
                console.log("err=", err);
                return next(err);
            }
            req.logIn(user, function (err) {
                if (err) {
                    // return next(err);
                    // console.log("err", err)
                    return res.json({
                        success: false,
                        data: {
                            status: 0,
                            message: err.message,
                            result: []
                        },
                    });
                }
                // console.log(" req.logIn", user)
                if (!user) {
                    return res.status(401).json({
                        status: "error",
                        code: "unauthorized"
                    })
                } else {
                    // now check is user has enabled google authenticator - 2FA  
                    return res.json({
                        success: true,

                        status: 1,
                        user: user,
                        accessToken: jwt.sign({
                            user: user
                        },
                            secret, {
                            expiresIn: '1d'
                        })

                    });
                }
            });
        })(req, res, next);
    });

router.post('/getUsersByID',
    function (req, res, next) {

        // passport.authenticate('jwt', { session: false }, function (err, user) {
        //   console.log("in get users", user);
        //   if (!a.isEmpty(user) && !err) {

        var user_id = req.body;
        employee.getUserById(user_id, function (err, result) {
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

    //   else {
    //     // var err = new Error('User is not logged in');
    //     // return next(err);
    //     return res.json({
    //       success: false,
    //       data: {
    //         status: 0,
    //         message: err.message,
    //         result: []
    //       },
    //     });
    //   }
    // })(req, res, next);
    //}
);
router.get('/getUserByToken',
    function (req, res, next) {
        passport.authenticate('jwt', { session: false }, function (err, user) {
            if (!a.isEmpty(user) && !err) {

                var user = user[0].id
                employee.getUserByToken(user, function (err, result) {
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
            } else {
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
    });

    router.get('/getUserByTokenDemo/:id',
    function (req, res, next) {
        // passport.authenticate('jwt', { session: false }, function (err, user) {
        //     if (!a.isEmpty(user) && !err) {

                var user = req.params.id
                employee.getUserByToken(user, function (err, result) {
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
        //     } else {
        //         // var err = new Error('User is not logged in');
        //         // return next(err);
        //         return res.json({
        //             success: false,
        //             data: {
        //                 status: 0,
        //                 message: err.message,
        //                 result: []
        //             },
        //         });
        //     }
        // })(req, res, next);
    });

router.post('/updateUser',
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
            employee.updateEmployee(nUser,
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
                                message: 'Update User Failed',
                                result1: {}
                            },
                        });
                    }

                    return res.json({
                        success: true,
                        data: {
                            status: 1,
                            message: 'User Updated successfully.',
                            result1
                        },
                    });
                });

        })(req, res, next);
    },
);

router.post('/deleteUser',
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
            employee.deleteEmployee(nUser,
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
                                message: 'User Delete Failed',
                                result1: {}
                            },
                        });
                    }

                    return res.json({
                        success: true,
                        data: {
                            status: 1,
                            message: 'User Deleted successfully.',
                            result1
                        },
                    });
                });

        })(req, res, next);
    },
);

router.get('/getAllUsers',
    function (req, res, next) {

        passport.authenticate('jwt', { session: false }, function (err, user) {
            // console.log("in get users", user);
            if (!a.isEmpty(user) && !err) {

                //   var user_id = req.body;
                employee.getAllEmployees(function (err, result) {
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


 

router.post('/changePassword',
    (req, res, next) => {

        // req.checkBody('id', 'ID should not be empty').isLength({
        //   min: 1,
        // });
        // req.checkBody('oldpassword', 'PASSWORD should not be empty').isLength({
        //   min: 1,
        // });
        // req.checkBody('newpassword', 'PASSWORD should not be empty').isLength({
        //   min: 1,
        // });
        const errors = req.validationErrors();
        if (errors) {
            return res.json({
                success: false,
                data: {
                    status: 0,
                    message: errors[0].msg,
                    result: []
                },
            });
        }
        return next();
    },
    (req, res, next) => {
        passport.authenticate('jwt', {
            session: false,
        }, (err, user) => {
            if (!a.isEmpty(user) && !err) {
                var loggedInUser = user[0];
                const updatePass = req.body;
                employee.isPasswordMatch(updatePass, loggedInUser,
                    function (err, isMatch) {
                        if (err) {
                            //Database connection error
                            return res.json({
                                success: false,
                                data: {
                                    status: 0,
                                    message: err.message,
                                    result: []
                                },
                            });
                        }
                        if (isMatch) {
                            employee.changePassword(updatePass, loggedInUser,
                                function (err, result) {
                                    if (err) {
                                        //Database connection error
                                        return res.json({
                                            success: false,
                                            data: {
                                                status: 0,
                                                message: err.message,
                                                result: []
                                            },
                                        });
                                    }

                                    if (result === undefined || result === null || result.length == 0) {
                                        return res.json({
                                            success: true,
                                            data: {
                                                status: 0,
                                                message: 'not init',
                                                result: {}
                                            },
                                        });
                                    }

                                    return res.json({
                                        success: true,
                                        data: {
                                            status: 1,
                                            message: 'Password update successfully.',
                                            result
                                        },
                                    });
                                });
                        } else {
                            return res.json({
                                success: true,
                                data: {
                                    status: 0,
                                    message: 'Old Password is not match.',
                                    result: []
                                },
                            });
                        }
                    });

            } else {
                // return next(new UnauthorizedAccess(ErrCode.AUTH_ERROR, undefined, 'User is not logged in'));
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
    },
);

router.post('/forgotpassword',
    // function (req, res, next) {
    //     req.checkBody('email', 'Username should not be empty.');
    //     req.checkBody('password', 'Password length should be between 5 to 20').isLength({
    //         min: 4,
    //         max: 15
    //     });
    //     var errors = req.validationErrors();
    //     if (errors) {
    //         return res.json({
    //             success: false,
    //             data: {
    //                 verified: 0,
    //                 status: errors.message,
    //                 info: []
    //             },
    //         });
    //     }
    //     return next();
    // },
    function (req, res, next) {
        employee.findEmail(req.body.email,
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
                if (result.length != 0) {
                    newPass = Math.floor(100000 + Math.random() * 900000);
                    var user = result[0];
                    // user.password = newPass;
                    var tomail = user.email;
                    // var uname=user.username;

                    // User.updatefp(user, function (err, user) {
                    //     if (err) return res.json({ err })
                    //     if (user) {

                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: EnvironmentObj.USERNAME,
                            pass: EnvironmentObj.PASSWORD
                        }
                    });
                    var mailOptions = {
                        from:EnvironmentObj.USERNAME,
                        to: tomail,
                        subject: 'Reset Password',
                        html: "<b>Hi: </b>" + user.firstname + "<br> Seems like you forgot your password. If this is true,<a href=http://localhost:4200/recovery-password/" + user.id + "> Click here to reset your password</a><br>If you did not forgot your password you can safely ignore this email.<br>Thank you<br>Team BMTS."
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            return res.json({
                                message: "Mail has been sent",
                                user,
                                status: 1
                            });
                            // console.log('Email sent: ' + info.response);
                        }
                    });
                    //     }
                    // });

                } else {
                    return res.json({
                        message: "Mail send failed",
                        status: 0
                    });
                }
            })
    }); 

router.post('/recoveryPassword',

    function (req, res, next) {

        const updatePass = req.body; 

        employee.recoveryPassword(updatePass,
            function (err, result) {
                if (err) {
                    //Database connection error
                    return res.json({
                        success: false,
                        data: {
                            status: 0,
                            message: err.message,
                            result: []
                        },
                    });
                }

                if (result === undefined || result === null || result.length == 0) {
                    return res.json({
                        success: true,
                        data: {
                            status: 0,
                            message: 'not init',
                            result: {}
                        },
                    });
                }

                return res.json({
                    success: true,
                    data: {
                        status: 1,
                        message: 'Password update successfully.',
                        result
                    },
                });
            });
    });

router.post('/updateCompanySettings',
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
            obj.createdDate = new Date();
            obj.isActive = 'true'

            employee.updateCompanySettings(obj,
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
                                message: 'CompanySettings Update Failed',
                                result1: {}
                            },
                        });
                    }

                    return res.json({
                        success: true,
                        data: {
                            status: 1,
                            message: 'CompanySettings Updated successfully.',
                            result1
                        },
                    });
                });



        })(req, res, next);
    },
);

router.get('/getCompanyDetails',
    function (req, res, next) {

        passport.authenticate('jwt', { session: false }, function (err, user) {
            // console.log("in get users", user);
            if (!a.isEmpty(user) && !err) {

                //   var user_id = req.body;
                employee.getCompanyDetails(function (err, result) {
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
                    status: 0,
                    message: err.message,
                    result: []

                });
            }
        })(req, res, next);
    }
);

module.exports = router;