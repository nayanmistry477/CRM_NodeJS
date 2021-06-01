var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var passport = require('passport');
var multer = require('multer'); 
var auth = require('../helpers/auth/jwt');
var guid = require('aguid');
var LocalStrategy = require('passport-local').Strategy;
var Product = require('../models/product');
var generator = require('generate-password');
const nodemailer = require('nodemailer'); 
var a = require('underscore');

const { ErrCode } = require('../constants');
const { NotFound, BadRequest, InternalServer, UnauthorizedAccess, StateConflict } = require('../helpers/error');
var secret = 'xyz';


router.post('/createProduct',
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
                 

                    var name = req.body .productName.trim()
                    var validName = name.toLowerCase()
                    Product.isProductExists(validName,
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
                                productName: obj.productName,
                                category: obj.category,
                                sellPrice: obj.sellPrice,
                                costPrice: obj.costPrice,
                                quantity:obj.quantity,
                                reorderLevel: obj.reorderLevel,
                                isWOOConnected: obj.isWOOConnected,
                                wooProductID: obj.wooProductID, 
                                isActive: 'true',
                                createdDate: new Date(), 
                            };
                            Product.createProduct(nUser,
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
                                                message: 'Product Create Failed',
                                                result1: {}
                                            },
                                        });
                                    }
            
                                    return res.json({
                                        success: true,
                                        data: {
                                            status: 1,
                                            message: 'Product Created successfully.',
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
                              message: 'Product Already Exists',
                              result: []
                            },
                          });;
                        }
                      })
            
        })(req, res, next);
    },
); 
router.post('/createProductManually',
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
                 
                var allData = req.body
                    var name = req.body.name.trim()
                    var validName = name.toLowerCase() 
                    
                    Product.isProductManualExists(validName,allData,
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
                                jobID:obj.jobID,
                                invoiceID:obj.invoiceID, 
                                quoteID:obj.quoteID, 
                                name: obj.name, 
                                sellPrice: obj.sellPrice, 
                                unitPrice:obj.unitPrice,
                                quantity:obj.quantity, 
                                isActive: 'true',
                                createdDate: new Date(), 
                            };
                            Product.createProductManually(nUser,
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
                                                message: 'Product Create Failed',
                                                result1: {}
                                            },
                                        });
                                    }
            
                                    return res.json({
                                        success: true,
                                        data: {
                                            status: 1,
                                            message: 'Product Added  successfully.',
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
                              message: 'Product Already Exists',
                              result: []
                            },
                          });;
                        }
                      })
            
        })(req, res, next);
    },
); 
router.post('/updateProduct',
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
                Product.updateProduct(nUser,
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
                                    message: 'Update Product Failed',
                                    result1: {}
                                },
                            });
                        }

                        return res.json({
                            success: true,
                            data: {
                                status: 1,
                                message: 'Product Updated successfully.',
                                result1
                            },
                        });
                    }); 
           
        })(req, res, next);
    },
);
router.post('/updateProductManually',
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
                Product.updateProductManually(nUser,
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
                                    message: 'Update Product Failed',
                                    result1: {}
                                },
                            });
                        }

                        return res.json({
                            success: true,
                            data: {
                                status: 1,
                                message: 'Product Updated successfully.',
                                result1
                            },
                        });
                    }); 
           
        })(req, res, next);
    },
); 
router.post('/deleteProduct',
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
                Product.deleteProduct(nUser,
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
                                    message: 'Product Delete Failed',
                                    result1: {}
                                },
                            });
                        }

                        return res.json({
                            success: true,
                            data: {
                                status: 1,
                                message: 'Product Deleted successfully.',
                                result1
                            },
                        });
                    }); 
           
        })(req, res, next);
    },
);
router.post('/deleteProductManually',
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
                Product.deleteProductManually(nUser,
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
                                    message: 'Product Delete Failed',
                                    result1: {}
                                },
                            });
                        }

                        return res.json({
                            success: true,
                            data: {
                                status: 1,
                                message: 'Product Deleted successfully.',
                                result1
                            },
                        });
                    }); 
           
        })(req, res, next);
    },
); 

router.post('/getProductByProductID',
function (req, res, next) {

  passport.authenticate('jwt', { session: false }, function (err, user) {
  
    if (!a.isEmpty(user) && !err) {

      var nData = req.body;
      Product.getProductByProductID(nData,function (err, result) {
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
router.get('/getAllProducts',
function (req, res, next) {

  passport.authenticate('jwt', { session: false }, function (err, user) {
    // console.log("in get users", user);
    if (!a.isEmpty(user) && !err) {

    //   var user_id = req.body;
      Product.getAllProducts(function (err, result) {
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
router.post('/getManualProductByInvoiceID',
function (req, res, next) {

  passport.authenticate('jwt', { session: false }, function (err, user) {
  
    if (!a.isEmpty(user) && !err) {

      var nData = req.body;
      Product.getManualProductByInvoiceID(nData,function (err, result) {
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
router.post('/getManualProductByJobID',
function (req, res, next) {

  passport.authenticate('jwt', { session: false }, function (err, user) {
  
    if (!a.isEmpty(user) && !err) {

      var nData = req.body;
      Product.getManualProductByJobID(nData,function (err, result) {
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
router.post('/getProductManualByProductID',
function (req, res, next) {

  passport.authenticate('jwt', { session: false }, function (err, user) {
  
    if (!a.isEmpty(user) && !err) {

      var nData = req.body;
      Product.getProductManualByProductID(nData,function (err, result) {
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
router.post('/getManualProductByQuoteID',
function (req, res, next) {

  passport.authenticate('jwt', { session: false }, function (err, user) {
  
    if (!a.isEmpty(user) && !err) {

      var nData = req.body;
      Product.getManualProductByQuoteID(nData,function (err, result) {
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


// router.post('/updateProductOnJob',
//     (req, res, next) => {

//         const errors = req.validationErrors();
//         if (errors) {
//             return next(new BadRequest(ErrCode.VALIDATION_FAILED, undefined, errors));
//         }
//         return next();
//     },
//     (req, res, next) => {
//         passport.authenticate('jwt', {
//             session: false,
//         }, (err, user) => { 
//                 const nUser = req.body; 
//                 Product.updateProductOnJob(nUser,
//                     function (err, result1) {
//                         if (err) {
//                             //Database connection error
//                             return res.json({
//                                 success: false,
//                                 data: {
//                                     status: 0,
//                                     message: err.message,
//                                     result1: []
//                                 },
//                             });
//                         }
//                         if (result1 === undefined || result1 === null || result1.length == 0) {
//                             return res.json({
//                                 success: true,
//                                 data: {
//                                     status: 0,
//                                     message: 'Update Product Failed',
//                                     result1: {}
//                                 },
//                             });
//                         }

//                         return res.json({
//                             success: true,
//                             data: {
//                                 status: 1,
//                                 message: 'Product Updated successfully.',
//                                 result1
//                             },
//                         });
//                     }); 
           
//         })(req, res, next);
//     },
// );  
module.exports = router;