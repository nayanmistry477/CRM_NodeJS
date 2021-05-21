const pool = require('../connections/mysql');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt'); 

exports.createQuotation = function (quote, cb) {
    // user.CREATED_DATE = new Date();
    // user.STATUS = 1;
    // user.ACTIVE = 1;
  //   console.log(employee)
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }  
      var num = Math.floor(Math.random() * 9000) + 1000;
      var ID = 'BMTS' + new Date().getFullYear() + num
      var date = new Date();
        // Store hash in database 
        connection.query(
          'INSERT INTO `quotation_master` (`quoteID`,`quotationDate`,`quoteTo`,`customerContact`,`customerEmail`,`address`,`subTotal`,`discount`,`totalPrice`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?,?,?,?,?)', 
          [ID,date, quote.quoteTo,quote.customerContact,quote.customerEmail,quote.address,quote.subTotal,quote.discount,quote.totalPrice,quote.createdDate,quote.isActive],
          (err, results, fields) => { 
            connection.release();
            if (err) {
              return rollBack(err, connection, cb); 
            }
            cb(err, quote)
          }
        ); 
  
    });
  };
 
 
  exports.updateQuotation  = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'UPDATE `quotation_master` SET invoiceID = ?, quotationDate = ?, address = ?,customerEmail = ?,customerContact = ?,subTotal = ?,discount = ?,totalPrice = ?, modifiedDate=now()  WHERE  id = ?', 
        [section.invoiceID, section.quotationDate, section.address,section.customerEmail,section.customerContact,section.subTotal,section.discount,section.totalPrice,section.id],
  
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


  exports.deleteQuotation = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'DELETE FROM  `quotation_master`  WHERE  id = ?', 
        [ section.id],
  
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
  exports.isQuotationExists = function (jobId, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        'SELECT * FROM `quotation_master` where jobId = ?', [jobId],
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
  

  exports.getAllQuotation = function (cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        "SELECT * from `quotation_master`",
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

 
  exports.getQuotationByID = function (id,cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return  connection.query(
        "SELECT * from `quotation_master` WHERE id = ?",[id.id],
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
    exports.getJobByQuoteID = function (id,cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        "SELECT * from `quotation_master` WHERE jobId = ?",[id.id],
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
 

  exports.updateProduct_ServiceFinalQuote = function (service, cb) {
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
  
            connection.query('INSERT INTO `quote_product_service` (`productID`,`quoteID`,`name`,`price`,`unitPrice`,`quantity`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?,?)',
              [service[i].productID, service[i].quoteID,   service[i].name, service[i].price, service[i].unitPrice,service[i].quantity, date, status],
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
              'UPDATE `quote_product_service` SET  price = ?,quantity = ?, modifiedDate=now()  WHERE  id = ? and quoteID = ?',
              [service[i].price, service[i].quantity, service[i].ID, service[i].quoteID],
              (err, product_list, fields) => {
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
            connection.query('INSERT INTO `quote_product_service` ( `serviceID`,`quoteID`, `name`,`price`,`quantity`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?)',
              [service[i].serviceID, service[i].quoteID,  service[i].name, service[i].price, service[i].quantity, date, status],
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
           
              'UPDATE `quote_product_service` SET   price = ?,quantity = ?,  modifiedDate=now()  WHERE  id = ? and quoteID = ?',
              [service[i].price, service[i].quantity, service[i].ID, service[i].quoteID],
              (err, product_list, fields) => {
                  // connection.release();
                 
                if (err) {
                  console.log("Error: " + err.message);
                  return cb(err, null)
                } 
                responseVal = true
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

  exports.createProduct_ServiceFinalInvoice =async  function (service, cb) {
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
   
            connection.query('INSERT INTO `sales_product_service` (`productID`,`invoiceID`,`name`,`price`,`unitPrice`,`quantity`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?,?)',
              [service[i].productID, service[i].invoiceID, service[i].name, service[i].price, service[i].unitPrice, service[i].quantity, date, status],
              (err, product_list, fields) => {
                  // connection.release();
                  responseVal = true
                if (err) {
                  console.log("Error: " + err.message);
                  return cb(err, null)
                }
  
              }
            ); 
          }
        } else {
  
          if (service[i].ID == undefined) {
  
            var proid = null
            connection.query('INSERT INTO `sales_product_service` ( `serviceID`,`invoiceID`,`name`,`price`,`quantity`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?)',
              [service[i].serviceID, service[i].invoiceID, service[i].name, service[i].price, service[i].quantity, date, status],
              (err, product_list, fields) => {
                  // connection.release();
                  responseVal = true
                if (err) {
                  console.log("Error: " + err.message);
                  return cb(err, null)
                } 
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
  exports.getProducts_ServiceByQuoteID = async function (data, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query("SELECT * from `quote_product_service` WHERE quoteID = ? ", [data.quoteID],
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
 
  exports.deleteItem = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'DELETE FROM  `quote_product_service`  WHERE  id = ?',
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
  exports.getInvoiceByQuoteID = function (id,cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        "SELECT * from `invoice_transaction` WHERE quoteID = ?",[id.quoteID],
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
  