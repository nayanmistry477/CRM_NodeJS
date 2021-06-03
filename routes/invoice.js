var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var passport = require('passport');
var multer = require('multer');

var auth = require('../helpers/auth/jwt');
var guid = require('aguid');
var LocalStrategy = require('passport-local').Strategy;
var Invoice = require('../models/invoice');
var generator = require('generate-password');
const nodemailer = require('nodemailer');

var a = require('underscore');

const { ErrCode } = require('../constants');
const { NotFound, BadRequest, InternalServer, UnauthorizedAccess, StateConflict } = require('../helpers/error');
var secret = 'xyz';


router.post('/createInvoice',
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
                 
              Invoice.isInvoiceExists(req.body.jobId,
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
                      obj.createdDate =  new Date(),
                      obj.isActive = "true";
      
                      Invoice.createInvoice(obj,
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
                                          message: 'Invoice Create Failed',
                                          result1: {}
                                      },
                                  });
                              }
      
                              return res.json({
                                  success: true,
                                  data: {
                                      status: 1,
                                      message: 'Invoice Created successfully.',
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
                                message: 'Invoice already created for this job',
                                result: []
                            },
                        });;
                    }
                })
            
        })(req, res, next);
    },
); 
router.post('/updateInvoice',
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
                const dDate = new Date(req.body.dueDate) 
                const inDate = new Date(req.body.invoiceDate) 

                nUser.dueDate = dDate;
                nUser.invoiceDate=inDate;
                Invoice.updateInvoice(nUser,
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
                                    message: 'Update Invoice Failed',
                                    result1: {}
                                },
                            });
                        }

                        return res.json({
                            success: true,
                            data: {
                                status: 1,
                                message: 'Invoice Updated successfully.',
                                result1
                            },
                        });
                    }); 
           
        })(req, res, next);
    },
);
 
router.post('/deleteInvoice',
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
                Invoice.deleteInvoice(nUser,
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
                                    message: 'Invoice Delete Failed', 
                                },
                            });
                        }

                        return res.json({
                            success: true,
                            data: {
                                status: 1,
                                message: 'Invoice Deleted successfully.', 
                            },
                        });
                    }); 
           
        })(req, res, next);
    },
)
router.post('/createProduct_ServiceFinalInvoice',
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
      // const nUser = { 
      //     psID:obj.psID,
      //     name: obj.name,  
      //     quantity: obj.quantity,  
      //     price:obj.price, 
      // };


      Invoice.createProduct_ServiceFinalInvoice(obj,
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
                message: ' Item Update Failed',
                result1: {}
              },
            });
          }

          return res.json({
            success: true,
            data: {
              status: 1,
              message: ' Item Updated successfully.',
              result1
            },
          });
        });



    })(req, res, next);
  },
);
router.post('/updateProduct_ServiceFinalInvoice',
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
      // const nUser = { 
      //     psID:obj.psID,
      //     name: obj.name,  
      //     quantity: obj.quantity,  
      //     price:obj.price, 
      // };


      Invoice.updateProduct_ServiceFinalInvoice(obj,
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
                message: ' Item Update Failed',
                result1: {}
              },
            });
          }

          return res.json({
            success: true,
            data: {
              status: 1,
              message: ' Item Updated successfully.',
              result1
            },
          });
        });



    })(req, res, next);
  },
);

router.post('/getProducts_ServiceByinvoiceID',
  function (req, res, next) {

    passport.authenticate('jwt', { session: false }, function (err, user) {
      // console.log("in get users", user);
      if (!a.isEmpty(user) && !err) {

        var data = req.body;
        Invoice.getProducts_ServiceByinvoiceID(data, function (err, result) {
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
router.post('/getInvoiceByjobID',
function (req, res, next) {

  passport.authenticate('jwt', { session: false }, function (err, user) {
    // console.log("in get users", user);
    if (!a.isEmpty(user) && !err) {

      var id = req.body;
    Invoice.getInvoiceByjobID(id,function (err, result) {
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

router.get('/getAllinvoices',
function (req, res, next) {

  passport.authenticate('jwt', { session: false }, function (err, user) {
    // console.log("in get users", user);
    if (!a.isEmpty(user) && !err) {

    //   var id = req.body;
    Invoice.getAllinvoices(function (err, result) {
        if (err) {
          return next(new InternalServer(ErrCode.DB_CONNECTION_ERROR, undefined, err.message));
        }
        if (result === undefined || result === null || result.length == 0) {
          return res.json({
            success: true,
           
              status: 0,
              message: 'Data not found',
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
 
router.post('/getInvoiceByID',
function (req, res, next) {

  passport.authenticate('jwt', { session: false }, function (err, user) {
    // console.log("in get users", user);
    if (!a.isEmpty(user) && !err) {

      var id = req.body;
    Invoice.getInvoiceByID(id,function (err, result) {
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