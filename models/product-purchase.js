const pool = require('../connections/mysql');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const Moment = require('moment');



exports.createProductPurchase = async function (product, cb) {
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
    return connection.query(
      'INSERT INTO `product_purchase_master` (`productID`,`product`,`supplier`,`quantity`,`purchaseDate`,`createdDate`,`isActive`) VALUES (?,?,?,?,?,?,?)',
      [product.productID, product.product, product.supplier, product.quantity, product.purchaseDate, product.createdDate, product.isActive],
      (err, results, fields) => {
        connection.release();
        if (err) {
          return rollBack(err, connection, cb);
        }

        cb(null, product);


      }
    );

  });
};

exports.updateProductPurchase = function (section, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      return cb(err, null);
    }
    return connection.query(
      'UPDATE `product_purchase_master` SET product = ?, supplier = ?,quantity = ?,purchaseDate = ?, modifiedDate=now()  WHERE  id = ?',
      [section.product, section.supplier, section.quantity, section.purchaseDate, section.id],
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

exports.deleteProductPurchase = function (section, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      return cb(err, null);
    }
    return connection.query(
      'UPDATE  `product_purchase_master` SET isActive ="false"  WHERE  id = ?',
      [section.id],

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






exports.getAllPurchaseCount = function (pid, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }
    var list = []
    connection.query(
      "SELECT SUM(quantity) as purchaseQty from `product_purchase_master` where productID = ? and isActive = 'true' ", [pid.productID],
      (err, results, fields) => {
        // connection.release();
        if (err) {
          console.log("Error: " + err.message);
        }

        // cb(err, results)
        // connection.query(
        //   "SELECT SUM(quantity) as StockQty from `stock_transaction` where productID = ? ", [pid.productID],
        //   (err, results1, fields) => {
        //     // connection.release();
        //     if (err) {
        //       console.log("Error: " + err.message);
        //     }
            // var str={purchaseQty:results[0].purchaseQty,stockQty:results1[0].StockQty}

            // cb(err, str)

            connection.query(
              "SELECT SUM(quantity) as saleQty from `sales_product_service` where productID = ?  ", [pid.productID],
              (err, results2, fields) => {
                // connection.release();
                if (err) {
                  console.log("Error: " + err.message);
                }
                var saleQty;
                var purchaseQty;
                var total
                if(results2[0].saleQty == null || results2[0].saleQty == undefined){
                  saleQty = 0
                }else{
                  saleQty = results2[0].saleQty;
                }
                if(results[0].purchaseQty == null || results[0].purchaseQty == undefined){
                  purchaseQty = 0
                }else{
                  purchaseQty = results[0].purchaseQty;
                } 
                if(purchaseQty == 0 && saleQty == 0){
                  total = 0
                }else{
                  if(Number(purchaseQty) > Number(saleQty)){
                    total = Number(purchaseQty) - Number(saleQty)
                  }if(Number(purchaseQty) < Number(saleQty)){
                    total = Number(saleQty) - Number(purchaseQty)
                  }
                  if(Number(purchaseQty) === Number(saleQty)){
                    total = Number(saleQty) - Number(purchaseQty)
                  }
                }
                 
                connection.query(
                  "SELECT * from `product_master` where id = ? ", [pid.productID],
                  (err, result4, fields) => {
                    connection.release();
                    if (err) {
                      console.log("Error: " + err.message);
                    }
                    list.push({ totalQty: total, product: result4[0] })
                    return cb(err, list)

                  }
                );

              }
            );

        //   }
        // );
      }
    );
  });
};

exports.getAllPurchaseCountforUpdate = function (pid, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }
    var list = []
    connection.query(
      "SELECT SUM(quantity) as purchaseQty from `product_purchase_master` where productID = ? and isActive = 'true'  ", [pid.productID],
      (err, results, fields) => {
        // connection.release();
        if (err) {
          console.log("Error: " + err.message);
        }
        // cb(err, results)
        // console.log("TotalQuantity", results[0])
        // connection.query(
        //   "SELECT SUM(quantity) as StockQty from `stock_transaction` where productID = ? ", [pid.productID],
        //   (err, results1, fields) => {
        //     // connection.release();
        //     if (err) {
        //       console.log("Error: " + err.message);
        //     }
            // var str={purchaseQty:results[0].purchaseQty,stockQty:results1[0].StockQty}

            // cb(err, str)

            connection.query(
              "SELECT SUM(quantity) as saleQty from `sales_product_service` where productID = ? ", [pid.productID],
              (err, results2, fields) => {
                // connection.release();
                if (err) {
                  console.log("Error: " + err.message);
                }
                // var str={purchaseQty:results[0].purchaseQty,stockQty:results1[0].StockQty,saleQty:results2[0].saleQty}

                // var total = Number(results1[0].StockQty) + Number(results[0].purchaseQty) - Number(results2[0].saleQty)

                var saleQty;
                var purchaseQty;
                var total
                if(results2[0].saleQty == null || results2[0].saleQty == undefined){
                  saleQty = 0
                }else{
                  saleQty = results2[0].saleQty;
                }
                if(results[0].purchaseQty == null || results[0].purchaseQty == undefined){
                  purchaseQty = 0
                }else{
                  purchaseQty = results[0].purchaseQty;
                } 
                if(purchaseQty == 0 && saleQty == 0){
                  total = 0
                }else{
                  if(Number(purchaseQty) > Number(saleQty)){
                    total = Number(purchaseQty) - Number(saleQty)
                  }if(Number(purchaseQty) < Number(saleQty)){
                    total = Number(saleQty) - Number(purchaseQty)
                  }
                  if(Number(purchaseQty) === Number(saleQty)){
                    total = Number(saleQty) - Number(purchaseQty)
                  }
                } 
                connection.query(
                  "SELECT * from `product_master` where id = ? ", [pid.productID],
                  (err, result4, fields) => {
                    connection.release();
                    if (err) {
                      console.log("Error: " + err.message);
                    }
                    // var data = {id:result4[0].id,jobID:result4[0].jobID,productID:result4[0].productID,name:result4[0].name,price:results[0].price,quantity:result4[0].quantity}
                    list.push({ totalQty: total, product: result4[0] })
                    return cb(err, list)

                  }
                );

              }
            );

        //   }
        // );
      }
    );
  });
};



exports.getAllMinimumStocks = function (cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }
    // var startDate = new Date(data.start).toISOString()
    // var endDate = new Date(data.end).toISOString()
    return connection.query(
      // "SELECT  pro.productID as productId,pro.product as name, pro.quantity as Inward,sales.quantity as Outward FROM sales_product_service sales JOIN product_purchase_master pro ON (pro.createdDate BETWEEN '"+startDate+"' AND '"+endDate+"') OR (sales.createdDate BETWEEN '"+startDate+"' AND '"+endDate+"')   GROUP BY pro.productID",
      "SELECT   pro.productID as productId,pro.product as name, SUM(pro.quantity) as Inward   from  product_purchase_master pro where  pro.isActive = 'true'     GROUP BY productID  ",
      (err, results, fields) => {
        // connection.release();
        if (err) {
          console.log("Error: " + err.message);
        }
        connection.query(
          "SELECT  * FROM `sales_product_service` ",
          (err, results1, fields) => {
            connection.release();
            if (err) {
              console.log("Error: " + err.message);
            }
            var list = [];
            var str

            results.forEach(val => {

              var sub = results1.filter(x => JSON.parse(x.productID) === JSON.parse(val.productId));
              var sum = 0;
              sub.forEach(val1 => {
                if (val1.productID == val.productId) {
                  sum = Number(sum) + Number(val1.quantity)
                  val.Outward = sum
                } else {
                  val.Outward = sum;
                }
                // sum = Number(val.quantity) - Number(val1.quantity)  

              });

            });
            results.forEach(element => {
              var stock = Number(element.Inward) - Number(element.Outward)
              if (stock != null) {
                if (stock <= 10) {
                  element.availableStock = stock
                } else {
                  element.availableStock = 0
                }
              } else {
                element.availableStock = 0
              }
              element.minimumStock = 10

            });
            return cb(err, results)
          }
        )
        // return cb(err, results)
      }
    );
  });
}

exports.getAllProductPurchase = function (cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }
    return connection.query(
      "SELECT * from `product_purchase_master` where isActive = 'true' ",
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

exports.getAllChartCounts = function (cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }
    return connection.query(
      'SELECT EXTRACT(month FROM createdDate) "Month", count(*) AS jobCounts FROM `job_master` WHERE EXTRACT(YEAR FROM createdDate) = YEAR(CURDATE()) GROUP BY EXTRACT(month FROM createdDate) ORDER BY EXTRACT(month FROM createdDate)',
      (err, results, fields) => {
        // connection.release();
        if (err) {
          console.log("Error: " + err.message);
        }
        const allmonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];

        var list =  [];
        var str = 
        results.forEach(element => {
          if (element.Month == 1) element.Month = "January"
          if (element.Month == 2) element.Month = "February"
          if (element.Month == 3) element.Month = "March"
          if (element.Month == 4) element.Month = "April"
          if (element.Month == 5) element.Month = "May"
          if (element.Month == 6) element.Month = "June"
          if (element.Month == 7) element.Month = "July"
          if (element.Month == 8) element.Month = "August"
          if (element.Month == 9) element.Month = "September"
          if (element.Month == 10) element.Month = "October"
          if (element.Month == 11) element.Month = "November"
          if (element.Month == 12) element.Month = "December" 
          if(element.Month){
            str = { Month: element.Month, count: element.jobCounts } 
          }else{
            str = { Month: element.Month, count: 0 } 
          }
          // const item = results.find(item => item.Month === element.Month);
          // if(item.Month != element.Month){
          //   str = { Month: element.Month, count: element.jobCounts } 
          // }else{
          //   str = { Month: element.Month, count: 0 } 
          // }

          list.push(str)
        });

        
        let result = [];
        
        allmonths.forEach(month => {
          const item = list.find(item => item.Month === month);
          
          if (item) {
            result.push(item);
          } else {
            result.push({Month: month, count: 0});
          }
        })



        return connection.query(
          'SELECT EXTRACT(month FROM createdDate) "Month", count(*) AS customerCount  FROM `customer_master` WHERE EXTRACT(YEAR FROM createdDate) = YEAR(CURDATE()) GROUP BY EXTRACT(month FROM createdDate) ORDER BY EXTRACT(month FROM createdDate)',
          (err, results1, fields) => {
            // connection.release();
            if (err) {
              console.log("Error: " + err.message);
            }
            var list1 = []
            let result1 = [];
            var str1
            results1.forEach(element => {
              if (element.Month == 1) element.Month = "January"
              if (element.Month == 2) element.Month = "February"
              if (element.Month == 3) element.Month = "March"
              if (element.Month == 4) element.Month = "April"
              if (element.Month == 5) element.Month = "May"
              if (element.Month == 6) element.Month = "June"
              if (element.Month == 7) element.Month = "July"
              if (element.Month == 8) element.Month = "August"
              if (element.Month == 9) element.Month = "September"
              if (element.Month == 10) element.Month = "October"
              if (element.Month == 11) element.Month = "November"
              if (element.Month == 12) element.Month = "December"
              // str1 = { Month: element.Month, count: element.customerCount }

              if(element.Month){
                str1 = { Month: element.Month, count: element.customerCount } 
              }else{
                str1 = { Month: element.Month, count: 0 } 
              }
              list1.push(str1)
            });
        
         
            
            allmonths.forEach(month => {
              const item = list1.find(item => item.Month === month);
              
              if (item) {
                result1.push(item);
              } else {
                result1.push({Month: month, count: 0});
              }
            })

            return connection.query(
              'SELECT EXTRACT(month FROM createdDate) "Month", SUM(totalPrice) AS revenueCounts  FROM `invoice_transaction` WHERE EXTRACT(YEAR FROM createdDate) = YEAR(CURDATE()) AND paymentStatus = "completed" GROUP BY EXTRACT(month FROM createdDate) ORDER BY EXTRACT(month FROM createdDate)',
              (err, results2, fields) => {
                connection.release();
                if (err) {
                  console.log("Error: " + err.message);
                }
                var list2 = []
                var str2
                results2.forEach(element => {
                  if (element.Month == 1) element.Month = "January"
                  if (element.Month == 2) element.Month = "February"
                  if (element.Month == 3) element.Month = "March"
                  if (element.Month == 4) element.Month = "April"
                  if (element.Month == 5) element.Month = "May"
                  if (element.Month == 6) element.Month = "June"
                  if (element.Month == 7) element.Month = "July"
                  if (element.Month == 8) element.Month = "August"
                  if (element.Month == 9) element.Month = "September"
                  if (element.Month == 10) element.Month = "October"
                  if (element.Month == 11) element.Month = "November"
                  if (element.Month == 12) element.Month = "December"
                  // str2 = { Month: element.Month, count: element.revenueCounts }

                  if(element.Month){
                    str2 = { Month: element.Month, count: element.revenueCounts } 
                  }else{
                    str2 = { Month: element.Month, count: 0 } 
                  }
                  list2.push(str2)
                });

                const allmonths2 = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        
                let result2 = [];
                
                allmonths.forEach(month => {
                  const item = list2.find(item => item.Month === month);
                  
                  if (item) {
                    result2.push(item);
                  } else {
                    result2.push({Month: month, count: 0});
                  }
                })
                var allCounts = { jobCounts: result, customerCounts: result1, revenueCounts: result2 }
                cb(err, allCounts)
              }


            );
          }


        );
      }

      // var jobCounts = {jobCounts:list}
      // cb(err, jobCounts)
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
