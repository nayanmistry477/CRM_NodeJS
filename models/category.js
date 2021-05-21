const pool = require('../connections/mysql');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt'); 


exports.createCategory = function (category, cb) {
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
          'INSERT INTO `partcategory_master` (`categoryName`,`createdDate`,`isActive`) VALUES (?,?,?)', 
          [category.categoryName,category.createdDate,category.isActive],
          (err, results, fields) => { 
            connection.release();
            if (err) {
              return rollBack(err, connection, cb); 
            }
            cb(err, category)
          }
        ); 
  
    });
  };
  exports.isCategoryExists = function (name, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        'SELECT * FROM `partcategory_master` where `categoryName` = ?', [name],
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
  exports.updateCategory  = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'UPDATE `partcategory_master` SET categoryName = ?,modifiedDate=now()  WHERE  id = ?', 
        [section.categoryName,section.id],
  
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

  exports.deleteCategory   = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'DELETE FROM  `partcategory_master`  WHERE  id = ?', 
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


  exports.getAllCategories  = function (cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        "SELECT * from `partcategory_master` ",
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
  