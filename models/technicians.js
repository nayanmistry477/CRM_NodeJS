const pool = require('../connections/mysql');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { user } = require('../configs/db');
const db = require('../configs/db');

const randomFixedInteger = function (length) {
  return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
};

exports.createTechnician = function (technician, cb) { 
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    } 
      var modifiedDate = null;
      connection.query(
        'INSERT INTO `technician_master` (`firstname`,`lastname`,`email`,`contactNo`, `address`,`createdDate`,`isActive` ) VALUES (?,?,?,?,?,?,?)', 
        [technician.firstname,technician.lastname,technician.email,technician.contactNo, technician.address,technician.createdDate,technician.isActive],
        (err, results, fields) => { 
          connection.release();
          if (err) {
            return rollBack(err, connection, cb); 
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
        'SELECT * FROM `technician_master` where `email` = ?', [email],
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
 

  exports.updateTechnician  = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'UPDATE `technician_master` SET firstname = ?,lastname = ?, email = ?,contactNo = ?, address =  ?, modifiedDate=now()  WHERE  id = ?', 
        [section.firstname,section.lastname, section.email,section.contactNo,section.address,section.id],
  
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

  exports.deleteTechnician = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'DELETE FROM  `technician_master`  WHERE  id = ?', 
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
  
  
 exports.getAllTechnicians = function (cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        "SELECT * from `technician_master`",
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

 
  
  var rollBack = function (err, connection, cb) {
    if (connection === null) {
      return cb(Error('Unknown connection'), null);
    };
  
    return connection.rollback(function () {
      // connection.release();
      return cb(err, null);
    });
  }