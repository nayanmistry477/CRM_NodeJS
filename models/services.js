const pool = require('../connections/mysql');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const fs = require('fs');
var rmdir = require('rimraf');
const { EnvironmentObj } = require('../configs');
const { environmentObj } = require('../configs/environmentVariables');
const Moment = require('moment');

exports.createService = function (service, cb) {

  var num = Math.floor(Math.random() * 9000) + 1000;
  var ID = new Date().getFullYear() + num;
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }
    return connection.query(
      'INSERT INTO `service_master` (`serviceID`,`serviceName`,`price`,`createdDate`,`isActive`) VALUES (?,?,?,?,?)',
      [ID, service.serviceName, service.price, service.createdDate, service.isActive],
      (err, services, fields) => {
          connection.release();
        if (err) {
          console.log("Error: " + err.message);
          return cb(err, null)
        }
        cb(err, services);

      }
    );
  });
};
exports.isServiceExists = function (name, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }
    return connection.query(
      'SELECT * FROM `service_master` where `serviceName` = ?', [name],
      (err, results, fields) => {
        connection.release();
        if (err) {
          console.log("Error: " + err.message);
          cb(err, null)
        }
        cb(null, results)
      }
    );
  });
};
// exports.createProductList = function (products, cb) {
//   pool.getConnection((err, connection) => {
//     if (err) {
//       console.log('Error: ' + err.message);
//       return cb(err, null);
//     }
//     cb(err, products);
//     for (var i = 0; i < products.length; i++) {
//       var date = new Date()
//       var status = 'true';

//       connection.query(
//         'INSERT INTO `product_list` (`serviceID`,`product`,`quantity`,`price`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?)',
//         [products[i].serviceID, products[i].product, products[i].quantity, products[i].price, date, status],
//         (err, product_list, fields) => {
//           //   connection.release();
//           if (err) {
//             console.log("Error: " + err.message);
//             return cb(err, null)
//           }
//           //   services.forEach(element => {
//           //     var sub = sub_services.filter(x => x.product_id === element.product_id);
//           //     element.images = sub ? sub : [];
//           //   });
//           //    return cb(err, service);            
//         });
//     }
//   });
// };

exports.createOnlyService = function (service, cb) {
  var num = Math.floor(Math.random() * 9000) + 1000;
  var ID = new Date().getFullYear() + num;
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }
    return connection.query(
      'INSERT INTO `service_master` (`serviceID`,`serviceName`,`price`,`createdDate`,`isActive`) VALUES (?,?,?,?,?)',
      [ID, service.serviceName, service.price, service.createdDate, service.isActive],
      (err, services, fields) => {
          connection.release();
        if (err) {
          console.log("Error: " + err.message);
          return cb(err, null)
        }
        var obj = service
        obj.serviceID = ID;
        obj.id = services.insertId

        return cb(err, obj);

      }
    );
  });
};

// exports.updateService = function (service, products, cb) {
//   var sID;

//   sID = service.serviceID
//   // console.log("ALL PRoducts",sID)
//   pool.getConnection((err, connection) => {
//     if (err) {
//       console.log('Error: ' + err.message);
//       return cb(err, null);
//     }

//     return connection.query(
//       'UPDATE `service_master` SET serviceName = ?, price = ?, modifiedDate=now()  WHERE  id = ?',
//       [service.serviceName, service.price, service.id],
//       (err, services, fields) => {
//         //   connection.release();
//         if (err) {
//           console.log("Error: " + err.message);
//           cb(err, null)
//         }

//         cb(err, services);

//         for (var i = 0; i < products.length; i++) {
//           var date = new Date()
//           var status = 'true';
//           if (products[i].serviceID == null) {
//             // console.log("Service Data",service)
//             connection.query(
//               'INSERT INTO `product_list` (`serviceID`,`product`,`quantity`,`price`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?)',
//               [service.id, products[i].product, products[i].quantity,products[i].price, date, status],
//               (err, product_list, fields) => {
//                 //   connection.release();
//                 if (err) {
//                   console.log("Error: " + err.message);
//                   return cb(err, null)
//                 }
//                 //   services.forEach(element => {
//                 //     var sub = sub_services.filter(x => x.product_id === element.product_id);
//                 //     element.images = sub ? sub : [];
//                 //   });
//                 //    return cb(err, service);            
//               }
//             );

//           }
//         }
//       }
//     );
//   });
// };


exports.updateService = function (service, cb) {

  // console.log("ALL PRoducts",sID)
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }

    return connection.query(
      'UPDATE `service_master` SET serviceName = ?, price = ?, modifiedDate=now()  WHERE  id = ?',
      [service.serviceName, service.price, service.id],
      (err, services, fields) => {
          connection.release();
        if (err) {
          console.log("Error: " + err.message);
          cb(err, null)
        }

        cb(err, services);

      }
    );
  });
};
exports.deleteService = function (section, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }

    connection.query(
      'DELETE FROM  `service_master`  WHERE  id = ?',
      [section.id],
      (err, services, fields) => {
        connection.release();
        if (err) {
          console.log("Error: " + err.message);
          cb(err, null)
        }

        cb(err, section); 

      }
    );
  });
};
 
exports.getAllServices = function (cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }
    return connection.query(
      "SELECT * from `service_master` ",
      (err, results, fields) => {
        connection.release();
        if (err) {
          console.log("Error: " + err.message);
        }
        cb(err, results)
      }
    );
  });
};

// exports.getAllServices =async function (cb) {
//   pool.getConnection((err, connection) => {
//     if (err) {
//       console.log('Error: ' + err.message);
//       return cb(err, null);
//     }
//     return connection.query(
//       'SELECT * from `service_master`',
//       (err, services, fields) => {
//         // connection.release();
//         if (err) {
//           console.log("Error: " + err.message);
//           cb(err, null)
//         }
//         // cb(err, results);
//         return connection.query(
//           "SELECT * FROM `product_list` ",
//           (err, sub_services, fields) => {
//             connection.release();
//             if (err) {
//               console.log("Error: " + err.message);
//               cb(err, null)
//             }
//             services.forEach(element => {
//               var sub = sub_services.filter(x => JSON.parse(x.serviceID) === element.id);
//               element.products = sub ? sub : [];
//             });
//             cb(err, services);
//           }
//         );
//       }
//     );
//   });
// };

exports.getAllJobs = async function (cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }
    var responseVal = 0
 
     connection.query(
      'SELECT * from `job_master` WHERE isActive = "true"',
      (err, services, fields) => {
        // connection.release();
        responseVal = 1
        if (err) {
          console.log("Error: " + err.message);
          cb(err, null)
        }
        // cb(err, results);
          connection.query(
          "SELECT * FROM `sales_product_service`",
          (err, sub_services, fields) => {
            // connection.release();
            responseVal = 1
            if (err) {
              console.log("Error: " + err.message);
              cb(err, null)
            }
            services.forEach(element => {
              var sub = sub_services.filter(x => JSON.parse(x.jobID) === element.id);
              element.products = sub ? sub : [];
            });
              connection.query(
              "SELECT * FROM `attachment_master`",
              (err, attachments, fields) => {
                connection.release();
                responseVal = 1
                if (err) {
                  console.log("Error: " + err.message);
                  cb(err, null)
                }
                services.forEach(element => {
                  var sub = attachments.filter(x => JSON.parse(x.jobID) === element.id);
                  element.attachments = sub ? sub : [];
                });
                cb(err, services);
              }
            );
            // services.forEach(element => {
            //   var sub = sub_services.filter(x => JSON.parse(x.jobID) === element.id);
            //   element.products = sub ? sub : [];
            // });
            // cb(err, services);            
          }
        );
      }
      
    );
    // if(responseVal == 1){
    //   connection.release();
    // }else{
    //   return
    // }
    
  });
};
 

exports.createProduct_ServiceFinal = function (service, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }
    var responseVal = false
    cb(err, service);
    for (var i = 0; i < service.length; i++) {
      var date = new Date()
      var status = 'true';


      if (service[i].productID != null) {
        if (service[i].ID == undefined) { 
          connection.query('INSERT INTO `sales_product_service` (`productID`,`jobID`,`name`,`price`,`unitPrice`,`quantity`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?,?)',
            [service[i].productID, service[i].jobID, service[i].name, service[i].price, service[i].unitPrice, service[i].quantity, date, status],
            (err, result, fields) => {
                // connection.release();
              if (err) {
                console.log("Error: " + err.message);
                return cb(err, null)
              }
              responseVal = true

            }
          ); 
        }
      } else {

        if (service[i].ID == undefined) {

          var proid = null
          connection.query('INSERT INTO `sales_product_service` ( `serviceID`,`jobID`,`name`,`price`,`quantity`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?)',
            [service[i].serviceID, service[i].jobID, service[i].name, service[i].price, service[i].quantity, date, status],
            (err, result1, fields) => {
                // connection.release();
              if (err) {
                console.log("Error: " + err.message);
                return cb(err, null)
              }
              responseVal = true
              //   services.forEach(element => {
              //     var sub = sub_services.filter(x => x.product_id === element.product_id);
              //     element.images = sub ? sub : [];
              //   });

            }
          );


        }
      }
      
    }
    if(responseVal == true){
      connection.release();
    }else{
      connection.release();
    }
    
  });
};

exports.updateProduct_ServiceFinal = function (service, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }
    var responseVal = false
    for (var i = 0; i < service.length; i++) {
      var date = new Date()
      var status = 'true';


      if (service[i].productID != null) {
        if (service[i].ID == undefined) { 

          connection.query('INSERT INTO `sales_product_service` (`productID`,`jobID`,`invoiceID`,`name`,`price`,`unitPrice`,`quantity`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?,?,?)',
            [service[i].productID, service[i].jobID, service[i].invoiceID, service[i].name, service[i].price, service[i].unitPrice, service[i].quantity, date, status],
            (err, product_list, fields) => {
                // connection.release();
              if (err) {
                console.log("Error: " + err.message);
                return cb(err, null)
              }
              responseVal = true
            }
          );


        } else {
          connection.query(

            // 'INSERT INTO `sales_product_service` (`productID`,`jobID`,`name`,`price`,`quantity`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?)',
            // [service[i].productID, service[i].jobID, service[i].name, service[i].price, service[i].quantity, date, status],

            'UPDATE `sales_product_service` SET  price = ?,quantity = ?, modifiedDate=now()  WHERE  id = ? and jobID = ?',
            [service[i].price, service[i].quantity, service[i].ID, service[i].jobID],
            (err, product_list, fields) => {
                // connection.release();
              if (err) {
                console.log("Error: " + err.message);
                return cb(err, null)
              }
              responseVal = true
              //   services.forEach(element => {
              //     var sub = sub_services.filter(x => x.product_id === element.product_id);
              //     element.images = sub ? sub : [];
              //   });

            }
          );
        }
      } else {

        if (service[i].ID == undefined) {

          var proid = null
          connection.query('INSERT INTO `sales_product_service` ( `serviceID`,`jobID`,`invoiceID`,`name`,`price`,`quantity`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?,?)',
            [service[i].serviceID, service[i].jobID, service[i].invoiceID, service[i].name, service[i].price, service[i].quantity, date, status],
            (err, product_list, fields) => {
                connection.release();
              if (err) {
                console.log("Error: " + err.message);
                return cb(err, null)
              }
              responseVal = true
              //   services.forEach(element => {
              //     var sub = sub_services.filter(x => x.product_id === element.product_id);
              //     element.images = sub ? sub : [];
              //   });

            }
          );


        } else {
          connection.query(

            // 'INSERT INTO `sales_product_service` (`productID`,`jobID`,`name`,`price`,`quantity`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?)',
            // [service[i].productID, service[i].jobID, service[i].name, service[i].price, service[i].quantity, date, status],

            'UPDATE `sales_product_service` SET   price = ?,quantity = ?,  modifiedDate=now()  WHERE  id = ? and jobID = ?',
            [service[i].price, service[i].quantity, service[i].ID, service[i].jobID],
            (err, product_list, fields) => {
                connection.release();
              if (err) {
                console.log("Error: " + err.message);
                return cb(err, null)
              }
              responseVal = true
              //   services.forEach(element => {
              //     var sub = sub_services.filter(x => x.product_id === element.product_id);
              //     element.images = sub ? sub : [];
              //   });

            }
          );
        }
      }
    
    } 
    if(responseVal == true){
      connection.release();
    }else{
      connection.release();
    }
    return cb(err, service);
  });
};

exports.updateProduct_ServiceFinalInvoice = function (service, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }
    var responseVal = false
    for (var i = 0; i < service.length; i++) {
      var date = new Date()
      var status = 'true';


      if (service[i].productID != null) {
        if (service[i].ID == undefined) {


          connection.query('INSERT INTO `sales_product_service` (`productID`,`jobID`,`invoiceID`,`name`,`price`,`quantity`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?,?)',
            [service[i].productID, service[i].jobID, service[i].invoiceID, service[i].name, service[i].price, service[i].quantity, date, status],
            (err, product_list, fields) => {
                // connection.release();
                 
              if (err) {
                console.log("Error: " + err.message);
                return cb(err, null)
              }
              responseVal = true
            }
          );


        } else {
          connection.query(

            // 'INSERT INTO `sales_product_service` (`productID`,`jobID`,`name`,`price`,`quantity`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?)',
            // [service[i].productID, service[i].jobID, service[i].name, service[i].price, service[i].quantity, date, status],

            'UPDATE `sales_product_service` SET  price = ?,quantity = ?, modifiedDate=now()  WHERE  id = ? and invoiceID = ?',
            [service[i].price, service[i].quantity, service[i].ID, service[i].invoiceID],
            (err, product_list, fields) => {
                // connection.release();
                
              if (err) {
                console.log("Error: " + err.message);
                return cb(err, null)
              }
              responseVal = true
              //   services.forEach(element => {
              //     var sub = sub_services.filter(x => x.product_id === element.product_id);
              //     element.images = sub ? sub : [];
              //   });

            }
          );
        }
      } else {

        if (service[i].ID == undefined) {

          var proid = null
          connection.query('INSERT INTO `sales_product_service` ( `serviceID`,`jobID`,`invoiceID`,`name`,`price`,`quantity`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?,?)',
            [service[i].serviceID, service[i].jobID, service[i].invoiceID, service[i].name, service[i].price, service[i].quantity, date, status],
            (err, product_list, fields) => {
                // connection.release();
                 
              if (err) {
                console.log("Error: " + err.message);
                return cb(err, null)
              }
              responseVal = true
              //   services.forEach(element => {
              //     var sub = sub_services.filter(x => x.product_id === element.product_id);
              //     element.images = sub ? sub : [];
              //   });

            }
          );


        } else {
          connection.query(

            // 'INSERT INTO `sales_product_service` (`productID`,`jobID`,`name`,`price`,`quantity`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?)',
            // [service[i].productID, service[i].jobID, service[i].name, service[i].price, service[i].quantity, date, status],

            'UPDATE `sales_product_service` SET   price = ?,quantity = ?,  modifiedDate=now()  WHERE  id = ? and invoiceID = ?',
            [service[i].price, service[i].quantity, service[i].ID, service[i].invoiceID],
            (err, product_list, fields) => {
                // connection.release();
                
              if (err) {
                console.log("Error: " + err.message);
                return cb(err, null)
              }
              responseVal = true
              //   services.forEach(element => {
              //     var sub = sub_services.filter(x => x.product_id === element.product_id);
              //     element.images = sub ? sub : [];
              //   });

            }
          );
        }
      }
    }
    if(responseVal == true){
      connection.release();
    }else{
      connection.release();
    }
    return cb(err, service);
  });
};


// exports.updateSalesService = function (section, cb) {
//   pool.getConnection((err, connection) => {
//     if (err) {
//       return cb(err, null);
//     }
//     if (section.id == null) {
//       return connection.query(
//         'UPDATE `sales_product_service` SET  price = ?,quantity = 1, modifiedDate=now()  WHERE  id = ? and jobID = ?',
//         [section.price, section.ID, section.jobID],

//         (err2, results, fields) => {
//           connection.release();
//           if (err2) {
//             return cb(err2, null);
//           }
//           return cb(null, results);
//         },
//       );
//     } else {

//       return connection.query(
//         'UPDATE `sales_product_service` SET  price = ?,quantity = ?, modifiedDate=now()  WHERE  id = ? and jobID = ?',
//         [section.price, section.quantity, section.ID, section.jobID],

//         (err2, results, fields) => {
//           connection.release();
//           if (err2) {
//             return cb(err2, null);
//           }
//           return cb(null, results);
//         },
//       );
//     }

//   });
// };

exports.createAttachment = function (service, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }

    return connection.query('INSERT INTO `attachment_master` (`jobID`,`fileName`,`createdDate`) VALUES (?,?,?)',
      [service.jobID, service.fileName, service.createdDate],
      (err, product_list, fields) => {
          connection.release();
        if (err) {
          console.log("Error: " + err.message);
          cb(err, null)
        }
        //   services.forEach(element => {
        //     var sub = sub_services.filter(x => x.product_id === element.product_id);
        //     element.images = sub ? sub : [];
        //   });
        cb(err, service);

      }
    );
 
  });
};
exports.createJobFinal = function (service, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }
    var num = Math.floor(Math.random() * 9000) + 1000;
    var ID = 'BMTS' + new Date().getFullYear() + num;
    return connection.query(
      'INSERT INTO `job_master` (`jobId`,`customerID`,`customer`,`customerContact`,`customerEmail`,`address`,`postCode`,`brand`,`accompanying`,`damageAsses`,`itemType`,`serialNo`,`password`,`itemComment`,`underWarranty`,`bookedBy`,`storageLocation`, `jobStatus`,`statusStage`,`estDate`,`repairDescription`,`additionalNotes`,`technicianNotes`,`deposit`,`price`,`createdDate`,`isActive`) VALUES ( ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [ID, service.customerID, service.customer, service.customerContact, service.customerEmail, service.address, service.postCode, service.brand, service.accompanying, service.damageAsses, service.itemType, service.serialNo, service.password, service.itemComment, service.underWarranty, service.bookedBy, service.storageLocation,   service.jobStatus, service.statusStage, service.estDate, service.repairDescription, service.additionalNotes, service.technicianNotes, service.deposit, service.price, service.createdDate, service.isActive],
      (err, services, fields) => {
          connection.release();
        if (err) {
          console.log("Error: " + err.message);
          return cb(err, null)
        }
        return cb(err, services);

      }
    );
  });
};

exports.updateJobStatus = function (section, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      return cb(err, null);
    }
    return connection.query(
      'UPDATE `job_master` SET jobStatus = ?,modifiedDate=now()  WHERE  id = ?',
      [section.jobStatus, section.id], 
      (err2, results, fields) => {
        connection.release();
        if (err2) {
          return cb(err2, null);
        }
        return cb(null, results);
      },
    );
  });
};
exports.updateJobData = function (section, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      return cb(err, null);
    }
    return connection.query(
      'UPDATE `job_master` SET customer = ?,  customerContact = ?,customerEmail = ?,address = ?, itemType = ?, brand = ?, damageAsses = ?,underWarranty = ?,	serialNo = ?,accompanying = ?,itemComment = ?,password = ?,price = ?,deposit = ?,discount = ?,bookedBy = ?,assignedTo = ?,storageLocation = ?, jobStatus = ?,statusStage = ?,repairDescription = ?,additionalNotes = ?,technicianNotes = ?,estDate = ?,	completedDate = ?, modifiedDate=now()  WHERE  id = ?',
      [section.customer, section.customerContact, section.customerEmail, section.address, section.itemType, section.brand, section.damageAsses, section.underWarranty, section.serialNo, section.accompanying, section.itemComment, section.password, section.price, section.deposit, section.discount, section.bookedBy, section.assignedTo, section.storageLocation,  section.jobStatus, section.statusStage, section.repairDescription, section.additionalNotes, section.technicianNotes, section.estDate, section.completedDate, section.id],

      (err2, results, fields) => {
        connection.release();
        if (err2) {
          return cb(err2, null);
        }
        return cb(null, section);
      },
    );
  });
};
exports.updateJobDelete = function (section, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      return cb(err, null);
    }
    return connection.query(
      'UPDATE `job_master` SET deposit = ?,discount = ?, modifiedDate=now()  WHERE  id = ?',
      [section.deposit, section.discount, section.id],

      (err2, results, fields) => {
        connection.release();
        if (err2) {
          return cb(err2, null);
        }
        return cb(null, section);
      },
    );
  });
};


exports.getJobByJobId = function (section, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      return cb(err, null);
    }
    return connection.query(
      "SELECT * from `job_master` WHERE id = ?", [section.id], 
      (err2, results, fields) => {
        connection.release();
        if (err2) {
          return cb(err2, null);
        }
        cb(null, results);
      },
    );
  });
};

exports.getJobByCustomerID = function (email, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      return cb(err, null);
    }
    return connection.query(
      "SELECT * from `job_master` WHERE customerID = ?", [email.id],

      (err2, results, fields) => {
        connection.release();
        if (err2) {
          return cb(err2, null);
        }
        cb(null, results);
      },
    );
  });
};

exports.deleteJob = function (section, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      return cb(err, null);
    }
    var status = "false";
    connection.query(
      'UPDATE `job_master` SET isActive = ?, modifiedDate=now()  WHERE  id = ?',
      [status, section.id],

      (err2, results, fields) => {
        connection.release();
        if (err2) {
          return cb(err2, null);
        }
        cb(null, results);
        //  return connection.query(
        //   'UPDATE `invoice_master` SET isActive = ?, modifiedDate=now()  WHERE  jobId = ?',
        //   [status, section.id],

        //   (err2, results, fields) => {
        //     connection.release();
        //     if (err2) {
        //       return cb(err2, null);
        //     } 
        //   },
        // );

      },
    );
  });
};



exports.deleteItem = function (section, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      return cb(err, null);
    }
    return connection.query(
      'DELETE FROM  `sales_product_service`  WHERE  id = ?',
      [section.ID],

      (err2, results, fields) => {
        connection.release();
        if (err2) {
          return cb(err2, null);
        }
        return cb(null, results);
      },
    );
  });
};
exports.deleteAttachment = function (section, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      return cb(err, null);
    }
    return connection.query(
      'DELETE FROM  `attachment_master`  WHERE  id = ?',
      [section.id],

      (err2, results, fields) => {
        connection.release();
        if (err2) {
          return cb(err2, null);
        }

        // fs.unlinkSync('F:/Nayan/Angular/CRM_Project/src/'+section.src);
        // fs.unlinkSync(environmentObj.DELETEIMGPATH+ section.src);

        return cb(null, results);
      },
    );
  });
};
exports.getProducts_ServiceByjobID = async function (data, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }
    return connection.query("SELECT * from `sales_product_service` WHERE jobID = ? ", [data.jobID],
      (err, results, fields) => {
        connection.release();
        if (err) {
          console.log("Error: " + err.message);
        }
        return cb(err, results)
      }
    );
  });
};

exports.getProducts_ServiceByinvoiceID = async function (data, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }
    return connection.query("SELECT * from `sales_product_service` WHERE invoiceID = ? ", [data.invoiceID],
      (err, results, fields) => {
        connection.release();
        if (err) {
          console.log("Error: " + err.message);
        }
        return cb(err, results)
      }
    );
  });
};

exports.getServiceByServiceID = function (section, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      return cb(err, null);
    }
    return connection.query(
      'SELECT * FROM  `service_master`  WHERE  serviceID = ?',
      [section.id], 
      (err2, results, fields) => {
        connection.release();
        if (err2) {
          return cb(err2, null);
        }
        cb(null, results);
      },
    );
  });
};

exports.getattachmentsByjobID = async function (data, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }
    return connection.query(
      "SELECT * from `attachment_master` WHERE jobID = ? ", [data.jobID],
      (err, results, fields) => {
        connection.release();
        if (err) {
          console.log("Error: " + err.message);
        }
        cb(err, results)
      }
    );
  });
};
// exports.updateItemInfo = function (section, cb) {
//   pool.getConnection((err, connection) => {
//     if (err) {
//       return cb(err, null);
//     }
//     return connection.query(
//       'UPDATE `job_master` SET barcode = ?, repairDescription = ?,storageLocation = ?,deposit = ?, modifiedDate=now()  WHERE  id = ?',
//       [section.barcode, section.repairDescription, section.storageLocation, section.deposit, section.id],

//       (err2, results, fields) => {
//         connection.release();
//         if (err2) {
//           return cb(err2, null);
//         }
//         return cb(null, results);
//       },
//     );
//   });
// };

exports.getjobsByUserId = function (data, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }
    return connection.query(
      "SELECT * from `job_master` WHERE  assignedToID = ? and isActive = 'true' ", [data],
      (err, results, fields) => {
        connection.release();
        if (err) {
          console.log("Error: " + err.message);
        }
        cb(err, results)
      }
    );
  });
};

exports.getChecklistByItemType = function (name, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }
    return connection.query(
      'SELECT * FROM `service_master` where `serviceName` = ?', [name],
      (err, results, fields) => {
        connection.release();
        if (err) {
          console.log("Error: " + err.message);
          cb(err, null)
        }
        cb(null, results)
      }
    );
  });
};


// -------------------------------------------------
var rollBack = function (err, connection, cb) {
  if (connection === null) {
    return cb(Error('Unknown connection'), null);
  };

  return connection.rollback(function () {
    // connection.release();
    return cb(err, null);
  });
}
