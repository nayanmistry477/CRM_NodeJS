const pool = require('../connections/mysql');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt'); 
 

  exports.createPayment = function (invoice, cb) {
    // user.CREATED_DATE = new Date();
    // user.STATUS = 1;
    // user.ACTIVE = 1;
  //   console.log(employee)
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }  
        // Store hash in database 
        connection.query(
          'INSERT INTO `payment_invoice` (`invoiceId`,`jobId`,`addedBy`,`paymentType`,`paymentReference`,`amount`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?,?)', 
          [invoice.invoiceId,invoice.jobId,invoice.addedBy,invoice.paymentType,invoice.paymentReference,invoice.amount,invoice.createdDate,invoice.isActive],
          (err, results, fields) => { 
            connection.release();
            if (err) {
              return rollBack(err, connection, cb); 
            }
            cb(err, invoice)
          }
        ); 
  
    });
  };
  
  exports.updatePayment   = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
 
        'UPDATE `payment_invoice` SET addedBy = ?,paymentType = ?,paymentReference = ?,amount = ?, modifiedDate=now()  WHERE  id = ?', 
        [section.addedBy,section.paymentType,section.paymentReference,section.amount,section.id],
  
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
  exports.deletePayment = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'DELETE FROM  `payment_invoice`  WHERE  id = ?', 
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
    
  exports.getPaymentByInvoiceId = function (id,cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        "SELECT * from `payment_invoice` WHERE invoiceId = ?",[id.id],
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
  