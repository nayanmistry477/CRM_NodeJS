const pool = require('../connections/mysql');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
 
 

  
  exports.createEmailSettings = function (emailSettings, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      var responseVal = 0
      connection.query("SELECT * from `emailsettings_master`",
      (err, result, fields) => {
        
        if (err) {
          console.log("Error :" + err.message);
        } else {
          var detailss = result[0]; 
          
           
            if (detailss == undefined) {
              
              return connection.query(
                'INSERT INTO `emailsettings_master` (`fromAddress`,`server`,`password`,`port`,`username`,`encryptiontype`,`isSSL`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?,?,?)', 
                [emailSettings.fromAddress,emailSettings.server,emailSettings.password,emailSettings.port,emailSettings.username,emailSettings.encryptiontype,emailSettings.isSSL,emailSettings.createdDate,emailSettings.isActive],
              (err1, results, fields) => {
                  // connection.release();
                  responseVal == 1
                  if (err1) {
                    return cb(err1, null);
                  }
                  // console.log('results=', results);
                  return cb(null, results);
                },
              );
              // Passwords match
            } else {
           
              return connection.query(
                "DELETE FROM  `emailsettings_master`",
                (err2, resultD, fields) => {
                
                  if (err2) {
                    return cb(err, null);
                  }
                  if(resultD){
                    return connection.query(
                      'INSERT INTO `emailsettings_master` (`fromAddress`,`server`,`password`,`port`,`username`,`encryptiontype`,`isSSL`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?,?,?)', 
                      [emailSettings.fromAddress,emailSettings.server,emailSettings.password,emailSettings.port,emailSettings.username,emailSettings.encryptiontype,emailSettings.isSSL,emailSettings.createdDate,emailSettings.isActive],
                       (err1, results, fields) => {
                        // connection.release();
                        responseVal == 1
                        if (err1) {
                          return cb(err1, null);
                        }
                        // console.log('results=', results);
                        return cb(null, results);
                      },
                    );
                  }
                  // console.log('results=', results);
                  // return cb(null, results);
                },
              );
            }
          
  
        }
      }
    )
    if(responseVal == 1){
      connection.release();
    }else{
      return
    } 
    });
  };
  
 exports.getAllEmailSettings = function (cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        "SELECT * from `emailsettings_master`",
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
  