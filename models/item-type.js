const pool = require('../connections/mysql');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');




exports.createItemType = function (itemType, cb) {
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
          'INSERT INTO `itemtype_master` (`itemTypeName`,`createdDate`,`isActive`) VALUES (?,?,?)', 
          [itemType.itemTypeName,itemType.createdDate,itemType.isActive],
          (err, results, fields) => { 
            connection.release();
            if (err) {
              return rollBack(err, connection, cb); 
            }
            cb(err, itemType)
          }
        ); 
  
    });
  };

  exports.createChecklist = function (itemType, cb) {
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
          'INSERT INTO `checklist_master` (`itemTypeID`,`name`,`createdDate`,`isActive`) VALUES (?,?,?,?)', 
          [itemType.itemTypeID,itemType.name,itemType.createdDate,itemType.isActive],
          (err, results, fields) => { 
            connection.release();
            if (err) {
              return rollBack(err, connection, cb); 
            }
            cb(err, itemType)
          }
        ); 
  
    });
  };
  exports.updateChecklist  = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'UPDATE `checklist_master` SET name = ?, modifiedDate=now()  WHERE  id = ?', 
        [section.name,section.id],
  
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

  exports.deleteChecklist  = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'DELETE FROM  `checklist_master`  WHERE  id = ?', 
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
  exports.isItemTypeExists = function (name, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        'SELECT * FROM `itemtype_master` where `itemTypeName` = ?', [name],
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
  exports.isChecklistExists = function (obj, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        'SELECT * FROM `checklist_master` where `name` = ? and `itemTypeID` = ?', [obj.name,obj.itemTypeID],
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
 
  exports.updateItemType  = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'UPDATE `itemtype_master` SET itemTypeName = ?, modifiedDate=now()  WHERE  id = ?', 
        [section.itemTypeName,section.id],
  
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

  exports.deleteItemType  = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'DELETE FROM  `itemtype_master`  WHERE  id = ?', 
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
  
  
 exports.getAllItemTypes = function (cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      var responseVal = 0
        connection.query(
        "SELECT * from `itemtype_master`",
        (err, results, fields) => {
          // connection.release();
          responseVal == 1
          if (err) {
            console.log("Error: " + err.message);
          }
          // cb(err, results) 
         
          return connection.query(
            "SELECT * FROM `checklist_master`",
            (err, checkResult, fields) => {
              connection.release();
              responseVal == 1
              if (err) {
                console.log("Error: " + err.message);
                cb(err, null)
              }
              results.forEach(element => {
                var sub = checkResult.filter(x => JSON.parse(x.itemTypeID) === element.id);
                element.checkList = sub ? sub : [];
              });
              cb(err, results);
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

  exports.getCheckListByID = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      } 
        connection.query(
        'SELECT * FROM  `checklist_master`  WHERE  itemTypeID = ?', 
        [ section.itemTypeID],
  
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
  