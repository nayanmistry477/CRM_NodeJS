const pool = require('../connections/mysql');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt'); 


exports.createCustomer = function (customer, cb) {
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
          'INSERT INTO `customer_master` (`firstName`,`lastName`,`contactNo`,`customerType`,`email`,`referredBy`,`address`,`postCode`,`companyName`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?,?,?,?,?)', 
          [customer.firstName,customer.lastName,customer.contactNo,customer.customerType,customer.email,customer.referredBy,customer.address,customer.postCode,customer.companyName,customer.createdDate,customer.isActive],
          (err, results, fields) => { 
            connection.release();
            if (err) {
              return rollBack(err, connection, cb); 
            }
            cb(err, customer)
          }
        ); 
  
    });
  };
 
  exports.updateCustomer = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'UPDATE `customer_master`  SET firstName = ?, lastName = ?,contactNo = ?,customerType = ?,email = ?,referredBy = ?,address = ?,postCode = ?,companyName = ?,  modifiedDate=now()  WHERE  id = ?', 
        [section.firstName,section.lastName,section.contactNo,section.customerType,section.email,section.referredBy,section.address,section.postCode,section.companyName,   section.id],
  
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

  exports.deleteCustomer = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'DELETE FROM  `customer_master`  WHERE  id = ?', 
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
  exports.getAllCustomers = function (cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        "SELECT * from `customer_master` ",
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
  exports.doesEmailExist = function (email, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        'SELECT * FROM `customer_master` where `email` = ?', [email],
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


  exports.updateCustomerByEmail = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'UPDATE customer_master SET contactNo = ?, email = ?, modifiedDate=now()  WHERE  id = ?', 
        [section.contactNo,section.email,section.id],
  
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
  