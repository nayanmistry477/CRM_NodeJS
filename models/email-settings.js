const pool = require('../connections/mysql');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');




// exports.createEmailSettings = function (emailSettings, cb) {
//     // user.CREATED_DATE = new Date();
//     // user.STATUS = 1;
//     // user.ACTIVE = 1;
//   //   console.log(employee)
//     pool.getConnection((err, connection) => {
//       if (err) {
//         console.log('Error: ' + err.message);
//         return cb(err, null);
//       } 
//         // Store hash in database 
//         connection.query(
//           'INSERT INTO `emailsettings_master` (`fromAddress`,`server`,`password	`,`port	`,`username`,`encryptiontype`,`createdDate`,`isActive`) VALUES (?,?,?)', 
//           [emailSettings.fromAddress,emailSettings.server,emailSettings.password,emailSettings.port,emailSettings.encryptiontype,emailSettings.createdDate,emailSettings.isActive],
//           (err, results, fields) => { 
//             connection.release();
//             if (err) {
//               return rollBack(err, connection, cb); 
//             }
//             cb(err, emailSettings)
//           }
//         ); 
  
//     });
//   };
 
  exports.updateEmailSettings  = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'UPDATE `emailsettings_master` SET fromAddress = ?,server = ?,password = ?,port = ?,username = ?,encryptiontype = ?, modifiedDate=now()  WHERE  id = ?', 
        [section.storageName,section.id],
  
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

  exports.deleteEmailSettings  = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'DELETE FROM  `emailsettings_master`  WHERE  id = ?', 
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
      // return connection.query(
      //   'INSERT INTO `footer_details` ( `shopURL`, `wireURL`,`facebookURL`,`instagramURL`,`twitterURL`,`created`) VALUES (?,?,?,?,?,?)',[trans.shopURL,trans.wireURL,trans.facebookURL,trans.instagramURL,trans.twitterURL,trans.created],
      //   (err, results, fields) => {
      //     connection.release();
      //     if (err) {
      //       // return rollBack(err, connection, cb);
      //     //   return err;
      //         cb(err, null);
      //       console.log("Error: " + err.message);
      //     }
      //     cb(err, results)
      //   }
      // );
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
  