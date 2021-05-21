var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var passport = require('passport');
var multer = require('multer');

var auth = require('../helpers/auth/jwt');
var guid = require('aguid');
var LocalStrategy = require('passport-local').Strategy;
var Services = require('../models/services');
var generator = require('generate-password');
const nodemailer = require('nodemailer');
var a = require('underscore');
const { EnvironmentObj } = require('../configs');
const DOCPATH = 'D:/CRM_Project/CRMAngular/src/assets/uploads';
// const DOCPATH = "F:/Nayan/Angular/CRM_Project/src/assets/uploads"
// const DOCPATH = ' '
// const DBIMGPATH = ' ';
var fs = require('fs');
var path = require('path');
// var upload = multer({ dest: 'uploads/' }) 
const DBIMGPATH = 'assets/uploads'; 
var upload = multer();

const { ErrCode } = require('../constants');
const { NotFound, BadRequest, InternalServer, UnauthorizedAccess, StateConflict } = require('../helpers/error');
var secret = 'xyz';


router.post('/createService',
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


      var name = req.body.services.serviceName.trim()
      var validName = name.toLowerCase()
      Services.isServiceExists(validName,
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

            const obj = req.body.services;
            const nUser = {
              serviceID: obj.serviceID,
              serviceName: obj.serviceName,
              price: obj.price,
              isActive: 'true',
              createdDate: new Date(),
            };

            // const products = req.body.products;
            Services.createService(nUser,
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
                      message: ' Service Create Failed',
                      result1: {}
                    },
                  });
                }

                return res.json({
                  success: true,
                  data: {
                    status: 1,
                    message: ' Service Created successfully.',
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
                message: 'Service Already Exists',
                result: []
              },
            });;
          }
        })



    })(req, res, next);
  },
);
router.post('/createWizardService', upload.single('file1'),
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
      obj.isActive = 'true';
      const cDate = new Date(req.body.completedDate)
      var estdate
      if (req.body.estDate == undefined || req.body.estDate == '') {
        estdate = ''
      } else {
        estdate = new Date(req.body.estDate)
      }

      // obj.completedDate = cDate
      obj.estDate = estdate
      Services.createJobFinal(obj,
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
                message: ' Service Create Failed',
                result1: {}
              },
            });
          }

          return res.json({
            success: true,
            data: {
              status: 1,
              message: ' Service Created successfully.',
              result1
            },
          });
        });



    })(req, res, next);
  },
);
router.post('/createAttachment/:jobID',
  (req, res, next) => {
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
        user = user[0];
        var mainPath = EnvironmentObj.DOCPATH;
        var imgPath = '/' + req.params.jobID + '/';
        var imgFullPath = mainPath + imgPath;
        var newFilename = '';
        var job_id = req.params.jobID;

        if (fs.existsSync(imgFullPath)) {
          //File Upload
          var final_path = imgFullPath;

          var storage = multer.diskStorage({
            destination: function (req, file, callback) {
              callback(null, final_path)
            },
            filename: function (req, file, callback) {
              newFilename = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
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
                if (ext.toLowerCase() !== '.png' && ext.toLowerCase() !== '.jpg' && ext.toLowerCase() !== '.jpeg'  ) {
                  return callback(res.end('Only .png .jpg .jpeg   file are allowed'), null)
                }
                return callback(null, true);
              }
            }).single('file');
            upload(req, res, function (err) {
              if (err) return res.json({
                err,
                status: 'error'
              });

              // var editedShop = {
              //   image_url: DBIMGPATH + imgPath + newFilename,
              //   shop_id: shop_id
              // }
              var product = {
                jobID: job_id,
                fileName: EnvironmentObj.DBIMGPATH + imgPath + newFilename,
                createdDate: new Date(),
              }

              Services.createAttachment(product,
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
                        message: 'File upload failed.',
                        result1: {}
                      },
                    });
                  }

                  return res.json({
                    success: true,
                    data: {
                      status: 1,
                      message: 'Service Created successfully.',
                      result1
                    },
                  });
                });
            });
          } else {
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
                    if (ext.toLowerCase() !== '.png' && ext.toLowerCase() !== '.jpg' && ext.toLowerCase() !== '.jpeg'  ) {
                      return callback(res.end('Only .png .jpg .jpeg  file are allowed'), null)
                    }
                    return callback(null, true);
                  }
                }).single('file');

                upload(req, res, function (err) {
                  if (err) return res.json({
                    err,
                    status: 'error'
                  });

                  var product = {
                    jobID: job_id,
                    fileName: EnvironmentObj.DBIMGPATH + imgPath + newFilename,
                    createdDate: new Date(),
                  }

                  Services.createAttachment(product,
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
                            message: 'File upload failed.',
                            result1: {}
                          },
                        });
                      }

                      return res.json({
                        success: true,
                        data: {
                          status: 1,
                          message: 'Service Created successfully.',
                          result1
                        },
                      });
                    });
                });
              }
            });
          }
        } else {
          fs.mkdir(imgFullPath, function (err) {
            if (err) {
              console.log('failed to create directory', err);
            }

            var final_path = imgFullPath;
            var storage = multer.diskStorage({
              destination: function (req, file, callback) {
                callback(null, final_path)
              },
              filename: function (req, file, callback) {
                newFilename = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
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
                  if (ext.toLowerCase() !== '.png' && ext.toLowerCase() !== '.jpg' && ext.toLowerCase() !== '.jpeg'  ) {
                    return callback(res.end('Only .png .jpg .jpeg   file are allowed'), null)
                  }
                  return callback(null, true);
                }
              }).single('file');

              upload(req, res, function (err) {
                if (err) return res.json({
                  err,
                  status: 'error'
                });

                var product = {
                  jobID: job_id,
                  fileName:EnvironmentObj.DBIMGPATH + imgPath + newFilename,
                  createdDate: new Date(),
                }

                Services.createAttachment(product,
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
                          message: 'File upload failed.',
                          result1: {}
                        },
                      });
                    }

                    return res.json({
                      success: true,
                      data: {
                        status: 1,
                        message: 'Service Created successfully.',
                        result1
                      },
                    });
                  });

              });
            } else {
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
                      if (ext.toLowerCase() !== '.png' && ext.toLowerCase() !== '.jpg' && ext.toLowerCase() !== '.jpeg'  ) {
                        return callback(res.end('Only .png .jpg .jpeg   file are allowed'), null)
                      }
                      return callback(null, true);
                    }
                  }).single('file');

                  upload(req, res, function (err) {
                    if (err) return res.json({
                      err,
                      status: 'error'
                    });
                    var product = {
                      jobID: job_id,
                      fileName: EnvironmentObj.DBIMGPATH + imgPath + newFilename,
                      createdDate: new Date(),
                    }
                    Services.createAttachment(product,
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
                              message: 'File upload failed.',
                              result1: {}
                            },
                          });
                        }

                        return res.json({
                          success: true,
                          data: {
                            status: 1,
                            message: 'Service Created successfully.',
                            result1
                          },
                        });
                      });
                  });
                }
              });
            }
          });
        }
      } else {
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
// router.post('/createProductList',
//   (req, res, next) => {

//     const errors = req.validationErrors();
//     if (errors) {
//       return next(new BadRequest(ErrCode.VALIDATION_FAILED, undefined, errors));
//     }
//     return next();
//   },
//   (req, res, next) => {
//     passport.authenticate('jwt', {
//       session: false,
//     }, (err, user) => {

//       const products = req.body.products;
//       Services.createProductList(products,
//         function (err, result1) {
//           if (err) {
//             //Database connection error
//             return res.json({
//               success: false,
//               data: {
//                 status: 0,
//                 message: err.message,
//                 result1: []
//               },
//             });
//           }
//           if (result1 === undefined || result1 === null || result1.length == 0) {
//             return res.json({
//               success: true,
//               data: {
//                 status: 0,
//                 message: 'Update Service Failed',
//                 result1: {}
//               },
//             });
//           }

//           return res.json({
//             success: true,
//             data: {
//               status: 1,
//               message: 'Service Updated successfully.',
//               result1
//             },
//           });
//         });

//     })(req, res, next);
//   },
// );
router.post('/updateService',
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

      // const products = req.body.products;
      const services = req.body.services;
      Services.updateService(services,
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
                message: 'Update Service Failed',
                result1: {}
              },
            });
          }

          return res.json({
            success: true,
            data: {
              status: 1,
              message: 'Service Updated successfully.',
              result1
            },
          });
        });

    })(req, res, next);
  },
);
router.post('/deleteService',
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
      Services.deleteService(nUser,
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
                message: 'Service Delete Failed',
                result1: {}
              },
            });
          }

          return res.json({
            success: true,
            data: {
              status: 1,
              message: 'Service Deleted successfully.',
              result1
            },
          });
        });

    })(req, res, next);
  },
);

router.post('/deleteProductList',
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
      Services.deleteProductList(nUser,
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

router.post('/createOnlyService',
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

     
        var name = req.body.serviceName.trim()
        var validName = name.toLowerCase()
        Services.isServiceExists(validName,
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
                serviceName: obj.serviceName,
                price: obj.price,
                isActive: 'true',
                createdDate: new Date(),
              };
        
        
              Services.createOnlyService(nUser,
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
                        message: ' Service Create Failed',
                        result1: {}
                      },
                    });
                  }
        
                  return res.json({
                    success: true,
                    data: {
                      status: 1,
                      message: ' Service Created successfully.',
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
                  message: 'Service Already Exists',
                  result: []
                },
              });;
            }
          })

    })(req, res, next);
  },
);

router.post('/createProduct_ServiceFinal',
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


      Services.createProduct_ServiceFinal(obj,
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
                message: ' Service Create Failed',
                result1: {}
              },
            });
          }

          return res.json({
            success: true,
            data: {
              status: 1,
              message: ' Service Created successfully.',
              result1
            },
          });
        });



    })(req, res, next);
  },
);

router.post('/updateProduct_ServiceFinal',
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


      Services.updateProduct_ServiceFinal(obj,
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


      Services.updateProduct_ServiceFinalInvoice(obj,
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

router.post('/updateJobStatus',
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

      Services.updateJobStatus(obj,
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
                message: 'Job status Update Failed',
                result1: {}
              },
            });
          }

          return res.json({
            success: true,
            data: {
              status: 1,
              message: ' Job status Updated successfully.',
              result1
            },
          });
        });



    })(req, res, next);
  },
);



router.get('/getAllServices',
  function (req, res, next) {

    passport.authenticate('jwt', { session: false }, function (err, user) {
      // console.log("in get users", user);
      if (!a.isEmpty(user) && !err) {

        //   var user_id = req.body;
        Services.getAllServices(function (err, result) {
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



router.post('/updateJobData',
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
      // nData.completedDate = new Date(req.body.completedDate).toISOString(); 
      var cDate = new Date(req.body.completedDate)
      var estdate 
      if(nData.statusStage == 'open'){
        cDate = null
      }
      if(req.body.estDate == ""){
        estdate = null
        
      }else{
        estdate = new Date(req.body.estDate)
      }
     
    
      nData.estDate = estdate;
      nData.completedDate = cDate
      Services.updateJobData(nData,
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
                message: 'Update Job Information Failed',
                result1: {}
              },
            });
          }

          return res.json({
            success: true,
            data: {
              status: 1,
              message: 'Job Information Updated successfully.',
              result1
            },
          });
        });

    })(req, res, next);
  },
);

// router.post('/updateItemInfo',
//   (req, res, next) => {

//     const errors = req.validationErrors();
//     if (errors) {
//       return next(new BadRequest(ErrCode.VALIDATION_FAILED, undefined, errors));
//     }
//     return next();
//   },
//   (req, res, next) => {
//     passport.authenticate('jwt', {
//       session: false,
//     }, (err, user) => {
//       const nData = req.body;
//       Services.updateItemInfo(nData,
//         function (err, result1) {
//           if (err) {
//             //Database connection error
//             return res.json({
//               success: false,
//               data: {
//                 status: 0,
//                 message: err.message,
//                 result1: []
//               },
//             });
//           }
//           if (result1 === undefined || result1 === null || result1.length == 0) {
//             return res.json({
//               success: true,
//               data: {
//                 status: 0,
//                 message: 'Update Repair Information Failed',
//                 result1: {}
//               },
//             });
//           }

//           return res.json({
//             success: true,
//             data: {
//               status: 1,
//               message: 'Repair Information Updated successfully.',
//               result1
//             },
//           });
//         });

//     })(req, res, next);
//   },
// );
router.get('/getAllJobs',
  function (req, res, next) {

    passport.authenticate('jwt', { session: false }, function (err, user) {
      // console.log("in get users", user);
      if (!a.isEmpty(user) && !err) {

        //   var user_id = req.body;
        Services.getAllJobs(function (err, result) {
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
router.post('/getJobByJobId',
  function (req, res, next) {

    passport.authenticate('jwt', { session: false }, function (err, user) {
      // console.log("in get users", user);
      if (!a.isEmpty(user) && !err) {

        var _id = req.body;
        Services.getJobByJobId(_id, function (err, result) {
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

router.post('/getJobByCustomerID',
  function (req, res, next) {

    passport.authenticate('jwt', { session: false }, function (err, user) {
      // console.log("in get users", user);
      if (!a.isEmpty(user) && !err) {

        var email = req.body;
        Services.getJobByCustomerID(email, function (err, result) {
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
router.post('/deleteJob',
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
      Services.deleteJob(nData,
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
                message: 'Job Delete Failed',
                result1: {}
              },
            });
          }

          return res.json({
            success: true,
            data: {
              status: 1,
              message: 'Job Deleted successfully.',
              result1
            },
          });
        });

    })(req, res, next);
  },
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
      Services.deleteItem(nData,
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

router.post('/getProducts_ServiceByjobID',
  function (req, res, next) {

    passport.authenticate('jwt', { session: false }, function (err, user) {
      // console.log("in get users", user);
      if (!a.isEmpty(user) && !err) {

        var data = req.body;
        Services.getProducts_ServiceByjobID(data, function (err, result) {
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
router.post('/getProducts_ServiceByinvoiceID',
  function (req, res, next) {

    passport.authenticate('jwt', { session: false }, function (err, user) {
      // console.log("in get users", user);
      if (!a.isEmpty(user) && !err) {

        var data = req.body;
        Services.getProducts_ServiceByinvoiceID(data, function (err, result) {
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
router.post('/getattachmentsByjobID',
  function (req, res, next) {

    passport.authenticate('jwt', { session: false }, function (err, user) {
      // console.log("in get users", user);
      if (!a.isEmpty(user) && !err) {

        var data = req.body;
        Services.getattachmentsByjobID(data, function (err, result) {
          if (err) {
            return next(new InternalServer(ErrCode.DB_CONNECTION_ERROR, undefined, err.message));
          }
          if (result === undefined || result === null || result.length == 0) {
            return res.json({
              success: true,

              status: 0,
              message: 'no record found',
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

router.post('/deleteAttachment',
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
      Services.deleteAttachment(nData,
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
                message: 'Attachment Delete Failed',
                result1: {}
              },
            });
          }

          return res.json({
            success: true,
            data: {
              status: 1,
              message: 'Attachment Deleted successfully.',
              result1
            },
          });
        });

    })(req, res, next);
  },
);

router.post('/getServiceByServiceID',
  function (req, res, next) {

    passport.authenticate('jwt', { session: false }, function (err, user) {

      if (!a.isEmpty(user) && !err) {

        var nData = req.body;
        Services.getServiceByServiceID(nData, function (err, result) {
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

// router.post('/updateSalesService',
//   (req, res, next) => {

//     const errors = req.validationErrors();
//     if (errors) {
//       return next(new BadRequest(ErrCode.VALIDATION_FAILED, undefined, errors));
//     }
//     return next();
//   },
//   (req, res, next) => {
//     passport.authenticate('jwt', {
//       session: false,
//     }, (err, user) => {
//       const nData = req.body;
//       Services.updateSalesService(nData,
//         function (err, result1) {
//           if (err) {
//             //Database connection error
//             return res.json({
//               success: false,
//               data: {
//                 status: 0,
//                 message: err.message,
//                 result1: []
//               },
//             });
//           }
//           if (result1 === undefined || result1 === null || result1.length == 0) {
//             return res.json({
//               success: true,
//               data: {
//                 status: 0,
//                 message: 'Update Service item Failed',
//                 result1: {}
//               },
//             });
//           }

//           return res.json({
//             success: true,
//             data: {
//               status: 1,
//               message: 'Service item Updated successfully.',
//               result1
//             },
//           });
//         });

//     })(req, res, next);
//   },
// );

router.get('/getjobsByUserId',
  function (req, res, next) {

    passport.authenticate('jwt', { session: false }, function (err, user) {
      // console.log("in get users", user);
      if (!a.isEmpty(user) && !err) {

        var _id = user[0].id;
        Services.getjobsByUserId(_id, function (err, result) {
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

router.post('/getChecklistByItemType',
  function (req, res, next) {

    passport.authenticate('jwt', { session: false }, function (err, user) {

      if (!a.isEmpty(user) && !err) {

        var nData = req.body;
        Services.getChecklistByItemType(nData, function (err, result) {
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