const pool = require('../connections/mysql');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { user } = require('../configs/db');
const db = require('../configs/db');

const randomFixedInteger = function (length) {
  return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
};

exports.signUp = function (employee, cb) {
  // user.CREATED_DATE = new Date();
  // user.STATUS = 1;
  // user.ACTIVE = 1;
//   console.log(employee)
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }
    // var hashpassword = '';
    // return bcrypt.hash(employee.password, 16, function (err, hash) {
      // Store hash in database
      // hashpassword = hash;
      var modifiedDate = null;
      connection.query(
        'INSERT INTO `user_master` (`firstname`,`lastname`,`jobTitle`,`email`,`contactNo`,`password`,`userRole`,`createdDate`,`isActive`,`modifiedDate`) VALUES (?,?,?,?,?,?,?,?,?,?)', 
        [employee.firstname,employee.lastname,employee.jobTitle,employee.email,employee.contactNo,employee.password,employee.userRole,employee.createdDate,employee.isActive,modifiedDate],
        (err, results, fields) => { 
          connection.release();
          if (err) {
            return rollBack(err, connection, cb); 
          }
          cb(err, results)
        }
      );
    // });

  });
};

exports.findEmail = function (email, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        'SELECT * FROM `user_master` where `email` = ?', [email],
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
  
  exports.Updatefp = function (user, cb) {
    // console.log('change', user )
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
  
      return bcrypt.hash(user.newpassword, 16, function (err, hash) {
        // Store hash in database
        connection.query(
          'UPDATE `user_details` SET `password` = ? WHERE  `id` = ?', [hash, user.id],
          (err, results, fields) => {
            connection.release();
            if (err) {
              return rollBack(err, connection, cb);
              // return err
              console.log("Error: " + err.message);
            }
            cb(err, results)
          }
        );
      });
      
    });
  };  

  exports.recoveryPassword = function (user, cb) {
    
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      } 
        // Store hash in database
        connection.query(
          'UPDATE `user_master` SET `password` = ? WHERE  `id` = ?', [user.newpassword, user.id],
          (err, results, fields) => {
            connection.release();
            if (err) {
              return rollBack(err, connection, cb);
              // return err 
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
        'SELECT * FROM `user_master` where `email` = ?', [email],
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
  
  exports.signIn = function (email, password, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      connection.query('select password from `user_master` where  `email` = ?', [email],
        (err, results, fields) => {
          
          if (err) {
            console.log("Error :" + err.message);
          } else {
            var dbPass = results[0];
            console.log(dbPass)
            if(dbPass != undefined){

            
            if(password == dbPass.password){

         
            // bcrypt.compare(password, dbPass.password, function (err, res) {
              // if (res) {
                // console.log(res)
                return connection.query(
                  'SELECT * FROM `user_master` WHERE `email` = ?', [email, password],
                  (err, results, fields) => {
                    connection.release();
                    if (err) {
                      console.log("Error: " + err.message);
                      cd(err,results)
                    }
                    cb(err, results)
                  }
                );
              }else{
                cb(err,null)
              }
            }else{
              cb(err,null)
            }
  
          }
        }
      ) 
    });
  };

  exports.changePassword = function (user,loggedInUser, cb) {
   
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
  
      // return bcrypt.hash(user.newpassword, 16, function (err, hash) {
        // Store hash in database
        connection.query(
          'UPDATE `user_master` SET `password` = ? WHERE  `id` = ?', [user.newpassword, loggedInUser.id],
          (err, results, fields) => {
            connection.release();
            if (err) {
              return rollBack(err, connection, cb);
              // return err
              console.log("Error: " + err.message);
            }
            cb(err, results)
          }
        );
      // });
      // return connection.query(
      //   'UPDATE `admin` SET `pass` = PASSWORD(?) WHERE  `ID` = ?', [user.newpassword, user.ID],
      //   (err2, results, fields) => {
      //     connection.release();
      //     if (err2) {
      //       return cb(err2, null);
      //     }
      //     console.log('results=', user);
      //     return cb(null, user);
      //   },
      // );
    });
  };
  exports.isPasswordMatch = function (user,loggedInUser, cb) {
    // console.log("loggedInUser", loggedInUser)
    var isMatch = false;
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      // SELECT * FROM sports_master.SM_USERS where ID = 6 and PASSWORD = password('admin');
  
      return connection.query('select password from `user_master` where `id` = ?', [loggedInUser.id],
        (err, results, fields) => {
          
          if (err) {
            console.log("Error :" + err.message);
          } else {
          
            var dbPass = results[0];
            if(user.oldpassword == dbPass.password){
            // bcrypt.compare(user.oldpassword, dbPass.password, function (err, res) {
             
                // console.log(res)
                connection.release();
                // Passwords match
                if (err) {
                  console.log("Error: " + err.message);
                  cb(err, isMatch)
                } 
               
                  isMatch = true;
                  cb(err, isMatch) 
             
            }else{
              cb(err, null)
            }
            // });
  
          }
        }
      )
      // return connection.query(
      //   'SELECT * FROM `SM_USERS` \
      //   WHERE `ID` = ? AND `PASSWORD` = PASSWORD(?)', [user.ID, user.OLD_PASSWORD],
      //   (err, results, fields) => {
      //     connection.release();
      //     if (err) {
      //       console.log("Error: " + err.message);
      //       cb(err, isMatch)
      //     }
      //     if (results.length > 0) {
      //       isMatch = true;
      //       cb(err, isMatch)
      //     } else {
      //       cb(err, isMatch)
      //     }
      //   }
      // );
    });
  };
  
  exports.findById = function (user, cb) {
    // console.log("user", user)
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error:' + err.message);
        return cb(err, null);
      }
      return connection.query(
        'SELECT * FROM `user_master` \
        WHERE `isActive` = "true" and `id` = ?'  , [user.id],
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

  exports.getUserByToken = function (useid,cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        "SELECT * from `user_master` where `id` = ?",[useid],
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

  exports.updateEmployee  = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'UPDATE `user_master` SET firstname = ?,lastname = ?,jobTitle = ?,email = ?,contactNo = ?,userRole = ?, modifiedDate=now()  WHERE  id = ?', 
        [section.firstname,section.lastname,section.jobTitle,section.email,section.contactNo,section.userRole,section.id],
  
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

  exports.deleteEmployee   = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'DELETE FROM  `user_master`  WHERE  id = ?', 
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
  
  
 exports.getAllEmployees = function (cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        "SELECT * from `user_master`",
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

  exports.updateCompanySettings = function (settngs, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
  
      connection.query("SELECT * from `company_details`",
      (err, result, fields) => {
        
        if (err) {
          console.log("Error :" + err.message);
        } else {
          var detailss = result[0]; 
          
           
        if (detailss == undefined) {
          
          return connection.query(
            'INSERT INTO `company_details` (`companyName`,`email`,`regNo`,`phone`,`logo`,`website`,`vatNo`,`streetAddress1`,`streetAddress2`,`town`,`city`,`country`,`postCode`,`paymentTerms`,`paymentDetails`,`currency`,`language`,`timeZone`,`createdDate`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', 
            [settngs.companyName,settngs.email,settngs.regNo,settngs.phone,settngs.logo,settngs.website,settngs.vatNo,settngs.streetAddress1,settngs.streetAddress2,settngs.town,settngs.city,settngs.country,settngs.postCode,settngs.paymentTerms,settngs.paymentDetails,settngs.currency,settngs.language,settngs.timeZone,settngs.createdDate],
          (err1, results, fields) => {
              connection.release();
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
            "DELETE FROM  `company_details`",
            (err2, resultD, fields) => {
            
              if (err2) {
                return cb(err, null);
              }
              if(resultD){
                return connection.query(
                  'INSERT INTO `company_details` (`companyName`,`email`,`regNo`,`phone`,`logo`,`website`,`vatNo`,`streetAddress1`,`streetAddress2`,`town`,`city`,`country`,`postCode`,`paymentTerms`,`paymentDetails`,`currency`,`language`,`timeZone`,`createdDate`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', 
                  [settngs.companyName,settngs.email,settngs.regNo,settngs.phone,settngs.logo,settngs.website,settngs.vatNo,settngs.streetAddress1,settngs.streetAddress2,settngs.town,settngs.city,settngs.country,settngs.postCode,settngs.paymentTerms,settngs.paymentDetails,settngs.currency,settngs.language,settngs.timeZone,settngs.createdDate],
                       (err1, results, fields) => {
                    connection.release();
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
    });
  };
  exports.getCompanyDetails = function (cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        "SELECT * from `company_details`",
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
  var rollBack = function (err, connection, cb) {
    if (connection === null) {
      return cb(Error('Unknown connection'), null);
    };
  
    return connection.rollback(function () {
      // connection.release();
      return cb(err, null);
    });
  }