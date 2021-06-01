const pool = require('../connections/mysql');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt'); 

exports.createProduct = function (product, cb) {
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
          'INSERT INTO `product_master` (`productName`,`category`,`sellPrice`,`costPrice`,`quantity`,`reorderLevel`,`isWOOConnected`,`wooProductID`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?,?,?,?)', 
          [product.productName,product.category,product.sellPrice,product.costPrice,product.quantity,product.reorderLevel,product.isWOOConnected,product.wooProductID,product.createdDate,product.isActive],
          (err, results, fields) => { 
            connection.release();
            if (err) {
              return rollBack(err, connection, cb); 
            }
            cb(err,results)
            // var obj = {
            //   productId:results.insertId,
            //   quantity:0,
            //   type:'Opening',
            //   date:new Date()
            // }
            
            // connection.query(
            //   'INSERT INTO `stock_transaction`(`productID`,`quantity`,`type`,`createdDate`) VALUES (?,?,?,?)', 
            //   [obj.productId,obj.quantity,obj.type,obj.date],
            //   (err, results, fields) => { 
            //     // connection.release();
            //     if (err) {
            //       return rollBack(err, connection, cb); 
            //     }
            //     // cb(err, results)
            //   }
            // ); 
          }
        ); 
  
    });
  };
  exports.isProductExists = function (name, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        'SELECT * FROM `product_master` where `productName` = ?', [name],
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

  exports.createProductManually = function (product, cb) {
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
          'INSERT INTO `manual_product_transaction` (`invoiceID`,`jobID`,`quoteID`,`name`,`sellPrice`,`unitPrice`,`quantity`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?,?,?)', 
          [product.invoiceID, product.jobID,product.quoteID,product.name, product.sellPrice,product.unitPrice,product.quantity, product.createdDate,product.isActive],
          (err, results, fields) => { 
            connection.release();
            if (err) {
              return rollBack(err, connection, cb); 
            }
            cb(err,results) 
          }
        ); 
  
    });
  };
  exports.isProductManualExists = function (name,proData, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      var val;
      if(proData.jobID !=null ||proData.jobID !="" || proData.jobID !=undefined ){
        val="SELECT * FROM `manual_product_transaction` WHERE name = '"+ name+"' AND jobID = '"+proData.jobID+"'"
      }else{
        if(proData.invoiceID !=null ||proData.invoiceID !="" || proData.invoiceID !=undefined ){ 
          val="SELECT * FROM `manual_product_transaction` WHERE name = '"+name+"' AND invoiceID = '"+proData.invoiceID+"'"
  
        }
      }
     
      return connection.query(
        val,  
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
  exports.updateProduct  = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'UPDATE `product_master` SET productName = ?, category = ?,sellPrice = ?,costPrice = ?,reorderLevel = ?,isWOOConnected = ?,wooProductID = ?,   modifiedDate=now()  WHERE  id = ?', 
        [section.productName,section.category,section.sellPrice,section.costPrice,section.reorderLevel,section.isWOOConnected,section.wooProductID, section.id],
  
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
  // exports.updateProductManually  = function (section, cb) {
  //   pool.getConnection((err, connection) => {
  //     if (err) {
  //       return cb(err, null);
  //     }
  //     return connection.query(
  //       'UPDATE `manual_product_transaction` SET productName = ?, sellPrice = ?,unitPrice = ?, quantity = ?, modifiedDate=now()  WHERE  id = ?', 
  //       [section.productName,section.sellPrice,section.unitPrice,section.quantity, section.id],
  
  //       (err2, results, fields) => {
  //         connection.release();
  //         if (err2) {
  //           return cb(err2, null);
  //         } 
  //         return cb(null, results);
  //       },
  //     );
  //   });
  // };
  exports.updateProductManually = function (service, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
  
      for (var i = 0; i < service.length; i++) {
        var date = new Date()
        var status = 'true';  
            connection.query( 
              'UPDATE `manual_product_transaction` SET  sellPrice = ?,quantity = ?,invoiceID = ?, modifiedDate=now()  WHERE  id = ?',
              [service[i].price, service[i].quantity,service[i].invoiceID,  service[i].id],
              (err, product_list, fields) => {
                  connection.release();
                if (err) {
                  console.log("Error: " + err.message);
                  return cb(err, null)
                } 
              }
            );
          }
         
      
      return cb(err, service);
    });
  };
  
  exports.deleteProduct  = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'DELETE FROM  `product_master`  WHERE  id = ?', 
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
  exports.deleteProductManually  = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
      return connection.query(
        'DELETE FROM  `manual_product_transaction`  WHERE  id = ?', 
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
  exports.getProductByProductID  = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
     return connection.query(
        'SELECT * FROM  `product_master`  WHERE  id = ?', 
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
  // exports.updateProductOnJob  = function (section, cb) {
  //   pool.getConnection((err, connection) => {
  //     if (err) {
  //       return cb(err, null);
  //     }
  //     return connection.query(
  //       'UPDATE `product_master` SET productName = ?, sellPrice = ?,costPrice = ?, modifiedDate=now()  WHERE  id = ?', 
  //       [section.name,section.price,section.price, section.id],
  
  //       (err2, results, fields) => {
  //         connection.release();
  //         if (err2) {
  //           return cb(err2, null);
  //         } 
  //         return cb(null, results);
  //       },
  //     );
  //   });
  // };
  exports.getAllProducts = function (cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        "SELECT * from `product_master` ",
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

  exports.getManualProductByInvoiceID  = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
     return connection.query(
        'SELECT * FROM  `manual_product_transaction`  WHERE  invoiceID = ?', 
        [ section.invoiceID],
  
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
  exports.getManualProductByJobID  = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
     return connection.query(
        'SELECT * FROM  `manual_product_transaction`  WHERE  jobID = ?', 
        [ section.jobID],
  
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
  exports.getProductManualByProductID  = function (section, cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        return cb(err, null);
      }
     return connection.query(
        'SELECT * FROM  `manual_product_transaction`  WHERE  id = ?', 
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
  exports.getManualProductByQuoteID = function (id,cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      return connection.query(
        "SELECT * from `manual_product_transaction` WHERE quoteID = ?",[id.quoteID],
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
  