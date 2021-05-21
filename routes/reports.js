var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var passport = require('passport');
var multer = require('multer');
const fs = require('fs');
var auth = require('../helpers/auth/jwt');
var guid = require('aguid');
var LocalStrategy = require('passport-local').Strategy;
var Reports = require('../models/reports');
var generator = require('generate-password');
const nodemailer = require('nodemailer');
var path = require('path');

var a = require('underscore');
const { EnvironmentObj } = require('../configs');
var upload = multer();
const { ErrCode } = require('../constants');
const { NotFound, BadRequest, InternalServer, UnauthorizedAccess, StateConflict } = require('../helpers/error');
var secret = 'xyz';

router.post('/getAllStocksByDate',
function (req, res, next) {

  passport.authenticate('jwt', { session: false }, function (err, user) {
    // console.log("in get users", user);
    if (!a.isEmpty(user) && !err) {

        var data = req.body
    //   var user_id = req.body;
    Reports.getAllStocksByDate(data, function (err, result) {
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

router.post('/getJobsByTechnicians',
    function (req, res, next) {

        passport.authenticate('jwt', { session: false }, function (err, user) {
            // console.log("in get users", user);
            if (!a.isEmpty(user) && !err) {

                  var data = req.body.technician;
                  Reports.getJobsByTechnicians(data,function (err, result) {
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
router.post('/getCustomerByDate',
    function (req, res, next) {

        passport.authenticate('jwt', { session: false }, function (err, user) {
            // console.log("in get users", user);
            if (!a.isEmpty(user) && !err) {

                  var data = req.body;
                  Reports.getCustomerByDate(data,function (err, result) {
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

router.post('/getPartsByDate',
    function (req, res, next) {

        passport.authenticate('jwt', { session: false }, function (err, user) {
            // console.log("in get users", user);
            if (!a.isEmpty(user) && !err) {

                  var data = req.body;
                  Reports.getPartsByDate(data,function (err, result) {
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
 
router.post('/getInvoiceByDate',
    function (req, res, next) {

        passport.authenticate('jwt', { session: false }, function (err, user) {
            // console.log("in get users", user);
            if (!a.isEmpty(user) && !err) {

                  var data = req.body;
                  Reports.getInvoiceByDate(data,function (err, result) {
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

router.post('/getJobStatusByDate',
    function (req, res, next) {

        passport.authenticate('jwt', { session: false }, function (err, user) {
            // console.log("in get users", user);
            if (!a.isEmpty(user) && !err) {

                  var data = req.body;
                  Reports.getJobStatusByDate(data,function (err, result) {
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
router.post('/uploadDocument/:jobId',  
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
        var final_path =EnvironmentObj.WORKSHEETDOCPATH  ;
        var fileName = 'Worksheet_'+req.params.jobId 
       
        var storage = multer.diskStorage({
            destination: function (req, file, callback) {
              callback(null, final_path)
            },
            filename: function (req, file, callback) {
              newFilename = fileName + path.extname(file.originalname);
              callback(null, newFilename);
            }
          });
        if (fs.existsSync(final_path)) {
            // Do something
            var upload = multer({
              storage: storage,
              limits: {
                fileSize: 100000000
              },
              fileFilter: function (req, file, callback) {
                var ext = path.extname(file.originalname)
                if (ext.toLowerCase() !== '.pdf' ) {
                    return callback(res.end('Only .pdf  files are allowed'), null)
                }
                return callback(null, true);
              }
            }).single('file');
            upload(req, res, function (err) {
              if (err) return res.json({
                err,
                status: 'error'
              });
 
              res.send({
                status:1, 
                message:'Worksheet uploaded successfully',
                // data:"F:/Nayan/nodejsAPI/"+filePath
            })
              
            });
          }
           else {
            fs.mkdir(final_path, function (err) {
              if (err) {
                console.log('failed to create directory', err);
              } else {

                var upload = multer({
                  storage: storage,
                  limits: {
                    fileSize: 100000000
                  },
                  fileFilter: function (req, file, callback) {
                    var ext = path.extname(file.originalname)
                    if (ext.toLowerCase() !== '.pdf' ) {
                      return callback(res.end('Only .pdf  files are allowed'), null)
                    }
                    return callback(null, true);
                  }
                }).single('file');

                upload(req, res, function (err) {
                  if (err) return res.json({
                    err,
                    status: 'error'
                  });
                  res.send({
                    status:1, 
                    message:'Worksheet uploaded successfully',
                    // data:"F:/Nayan/nodejsAPI/"+filePath
                })
                });
              }
            });
          }
       
 
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

router.post('/getAllDashboardCounts',
function (req, res, next) {

  passport.authenticate('jwt', { session: false }, function (err, user) {
    // console.log("in get users", user);
    if (!a.isEmpty(user) && !err) {
      var data;
      
        data = req.body
       
        
    //   var user_id = req.body;
    Reports.getAllDashboardCounts(data, function (err, result) {
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

router.post('/getAllDashboardPreviousCounts',
function (req, res, next) {

  passport.authenticate('jwt', { session: false }, function (err, user) {
    // console.log("in get users", user);
    if (!a.isEmpty(user) && !err) {
      var data;
      
        data = req.body
       
        
    //   var user_id = req.body;
    Reports.getAllDashboardPreviousCounts(data, function (err, result) {
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