var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var passport = require('passport');
var multer = require('multer');

var auth = require('../helpers/auth/jwt');
var guid = require('aguid');
var LocalStrategy = require('passport-local').Strategy;
var Quotation = require('../models/quotation');
var generator = require('generate-password');
const nodemailer = require('nodemailer');

var a = require('underscore');

const { ErrCode } = require('../constants');
const { NotFound, BadRequest, InternalServer, UnauthorizedAccess, StateConflict } = require('../helpers/error');
var secret = 'xyz';


router.post('/createQuotation',
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
            obj.createdDate =  new Date(),
            obj.isActive = "true";

            Quotation.createQuotation(obj,
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
                                message: 'Quotation Create Failed',
                                result1: {}
                            },
                        });
                    }

                    return res.json({
                        success: true,
                        data: {
                            status: 1,
                            message: 'Quotation Created successfully.',
                            result1
                        },
                    });
                });
          
            
        })(req, res, next);
    },
); 
router.post('/updateQuotation',
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
                const inDate = new Date(req.body.quoteDate) 
 
                nUser.quoteDate=inDate;
                Quotation.updateQuotation(nUser,
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
                                    message: 'Update Quotation Failed',
                                    result1: {}
                                },
                            });
                        }

                        return res.json({
                            success: true,
                            data: {
                                status: 1,
                                message: 'Quotation Updated successfully.',
                                result1
                            },
                        });
                    }); 
           
        })(req, res, next);
    },
); 
 
router.post('/deleteQuotation',
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
                Quotation.deleteQuotation(nUser,
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
                                    message: 'Quotation Delete Failed', 
                                },
                            });
                        }

                        return res.json({
                            success: true,
                            data: {
                                status: 1,
                                message: 'Quotation Deleted successfully.', 
                            },
                        });
                    }); 
           
        })(req, res, next);
    },
) 

router.post('/getJobByQuoteID',
function (req, res, next) {

  passport.authenticate('jwt', { session: false }, function (err, user) {
    // console.log("in get users", user);
    if (!a.isEmpty(user) && !err) {

      var id = req.body;
      Quotation.getJobByQuoteID(id,function (err, result) {
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

router.get('/getAllQuotation',
function (req, res, next) {

  passport.authenticate('jwt', { session: false }, function (err, user) {
    // console.log("in get users", user);
    if (!a.isEmpty(user) && !err) {

    //   var id = req.body;
    Quotation.getAllQuotation(function (err, result) {
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
 
router.post('/getQuotationByID',
function (req, res, next) {

  passport.authenticate('jwt', { session: false }, function (err, user) {
    // console.log("in get users", user);
    if (!a.isEmpty(user) && !err) {

      var id = req.body;
      Quotation.getQuotationByID(id,function (err, result) {
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
router.post('/getInvoiceByQuoteID',
function (req, res, next) {

  passport.authenticate('jwt', { session: false }, function (err, user) {
    // console.log("in get users", user);
    if (!a.isEmpty(user) && !err) {

      var id = req.body;
      Quotation.getInvoiceByQuoteID(id,function (err, result) {
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
router.post('/updateProduct_ServiceFinalQuote',
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


      Quotation.updateProduct_ServiceFinalQuote(obj,
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
                message: 'Item Update Failed',
                result1: {}
              },
            });
          }

          return res.json({
            success: true,
            data: {
              status: 1,
              message: 'Item Updated successfully.',
              result1
            },
          });
        });



    })(req, res, next);
  },
);


router.post('/getProducts_ServiceByQuoteID',
  function (req, res, next) {

    passport.authenticate('jwt', { session: false }, function (err, user) {
      // console.log("in get users", user);
      if (!a.isEmpty(user) && !err) {

        var data = req.body;
        Quotation.getProducts_ServiceByQuoteID(data, function (err, result) {
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

router.post('/deleteItem',
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
      const nData = req.body;
      Quotation.deleteItem(nData,
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
                message: 'Item Delete Failed',
                result1: {}
              },
            });
          }

          return res.json({
            success: true,
            data: {
              status: 1,
              message: 'Item Deleted successfully.',
              result1
            },
          });
        });

    })(req, res, next);
  },
);

module.exports = router;