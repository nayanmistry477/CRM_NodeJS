const pool = require('../connections/mysql');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt'); 

exports.createInvoice = function (invoice, cb) {
    // user.CREATED_DATE = new Date();
    // user.STATUS = 1;
    // user.ACTIVE = 1;
  //   console.log(employee)
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      } 
      var payStatus = 'pending';
      var num = Math.floor(Math.random() * 9000) + 1000;
      var ID = 'BMTS' + new Date().getFullYear() + num
      var date = new Date();
        // Store hash in database 
        connection.query(
          'INSERT INTO `invoice_transaction` (`invoiceID`,`quoteID`,`jobId`,`invoiceDate`,`dueDate`,`invoiceTo`,`contactDetails`,`customerContact`,`customerEmail`,`address`,`paymentDetails`,`subTotal`,`discount`,`deposit`,`totalPrice`,`createdDate`,`paymentStatus`,`isActive`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', 
          [ID,invoice.quoteID,invoice.jobId,date,date,invoice.invoiceTo,invoice.contactDetails,invoice.customerContact,invoice.customerEmail,invoice.address,invoice.paymentDetails,invoice.subTotal,invoice.discount,invoice.deposit,invoice.totalPrice,invoice.createdDate,invoice.paymentStatus,invoice.isActive],
          (err, results, fields) => { 
            connection.release();
            if (err) {
              return rollBack(err, connection, cb); 
            }
            invoice.invoiceID = ID;
            invoice.invoiceDate = date;
            invoice.dueDate = date;
            invoice.id = results.insertId
            cb(err, invoice)
          }
        ); 
  
    });
  };

 
 
  exports.updateInvoice  = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'UPDATE `invoice_transaction` SET invoiceDate = ?,dueDate = ?,contactDetails = ?,address = ?,customerEmail = ?,customerContact = ?,paymentDetails = ?,paymentType = ?,subTotal = ?,discount = ?,deposit = ?,extraDeposit = ?,totalPrice = ?,paymentStatus = ?, modifiedDate=now()  WHERE  id = ?', 
        [section.invoiceDate,section.dueDate,section.contactDetails,section.address,section.customerEmail,section.customerContact,section.paymentDetails,section.paymentType,section.subTotal,section.discount,section.deposit,section.extraDeposit,section.totalPrice,section.paymentStatus,section.id],
  
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


  exports.deleteInvoice = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      var responseVal = 0
        connection.query(
        'DELETE FROM  `invoice_transaction`  WHERE  id = ?', 
        [ section.id],
  
        (err2, results, fields) => {
          // connection.release();
          responseVal == 1
          if (err2) {
            return cb(err2, null);
          } 
          connection.query(
            'UPDATE `job_master` SET deposit = ?,discount = ?, modifiedDate=now()  WHERE  id = ?',
            [0, 0,section.jobId],
      
            (err2, results, fields) => {
              // connection.release();
              responseVal == 1
              if (err2) {
                return cb(err2, null);
              } 
            },
          );
          cb(null, results);
        },
      );
      if(responseVal == 1){
        connection.release();
      }else{
        return
      }
    });
  };
  
  
  exports.deleteStatus = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'DELETE FROM  `jobstatus_master`  WHERE  id = ?', 
        [ section.id],
  
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
  
  exports.isInvoiceExists = function (jobId, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        'SELECT * FROM `invoice_transaction` where jobId = ?', [jobId],
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
 
 exports.getAllStatus = function (cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        "SELECT * from `jobstatus_master`",
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


 

  exports.getAllinvoices = function (cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        "SELECT * from `invoice_transaction`",
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
  exports.getInvoiceByID = function (id,cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return  connection.query(
        "SELECT * from `invoice_transaction` WHERE id = ?",[id.id],
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
    exports.getInvoiceByjobID = function (id,cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        "SELECT * from `invoice_transaction` WHERE jobId = ?",[id.id],
        (err, results, fields) => {
          connection.release();
          if (err) {
            console.log("Error: " + err.message);
          }
        return  cb(err, results)
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
  