const pool = require('../connections/mysql');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');  
const Moment = require('moment');

exports.getAllStocksByDate = function (data, cb) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error: ' + err.message);
      return cb(err, null);
    }
    var responseVal = 0
    var val; 
    var currentDate 
    if (data.start != null && data.end != null && data.start != "" && data.end != "" && data.start != undefined && data.end != undefined) {

      var startDate = Moment(data.start).format('YYYY-MM-DD hh:mm:ss');
      currentDate = Moment(data.end).format('YYYY-MM-DD 12:59:59');

      val = "SELECT pro.productID as productId,pro.product as name, SUM(pro.quantity) as Inward   from  product_purchase_master pro  where pro.createdDate BETWEEN '" + startDate + "' AND '" + currentDate + "'   GROUP BY productID  "
      } else {
      if (data.label != null && data.label != "" && data.label != undefined) {
        var start = 1;
        var d = new Date;
        var day = d.getDay();
        var diff = d.getDate() - day + (start > day ? start - 7 : start);
        d.setDate(diff);
        var firstday = new Date(d.setDate(diff))
        var fDay = Moment(firstday).format('YYYY-MM-DD hh:mm:ss');
        var cDate = new Date()
        currentDate = Moment(cDate).format('YYYY-MM-DD 12:59:59'); 

        //For Month

        var offset = (new Date().getTimezoneOffset() / 60) * -1;
        var tmpDate = new Date(d.getTime() + offset);
        var y = tmpDate.getFullYear();
        var m = tmpDate.getMonth();
        var FDay = new Date(y, m, 1);
        var fmDay = Moment(FDay).format('YYYY-MM-DD hh:mm:ss');

        //For Year

        var dr = new Date(new Date().getFullYear(), 0, 1);
        var fdayYear = Moment(dr).format('YYYY-MM-DD hh:mm:ss');
        // var cDate=new Date()
        //For Quater

        var quter = Moment().startOf('quarter').format('YYYY-MM-DD hh:mm:ss');

        if (data.label.toLowerCase() == "thisweek") { 
          val = "SELECT pro.productID as productId,pro.product as name, SUM(pro.quantity) as Inward   from  product_purchase_master pro  where pro.createdDate BETWEEN '" + fDay + "' AND '" + currentDate + "'   GROUP BY productID  "
         }
        if (data.label.toLowerCase() == "thismonth") {
           val = "SELECT pro.productID as productId,pro.product as name, SUM(pro.quantity) as Inward   from  product_purchase_master pro  where pro.createdDate BETWEEN '" + fmDay + "' AND '" + currentDate + "'   GROUP BY productID  "

        }
        if (data.label.toLowerCase() == "thisquater") {
           val = "SELECT pro.productID as productId,pro.product as name, SUM(pro.quantity) as Inward   from  product_purchase_master pro  where pro.createdDate BETWEEN '" + quter + "' AND '" + currentDate + "'   GROUP BY productID  "

        }
        if (data.label.toLowerCase() == "thisyear") {
           val = "SELECT pro.productID as productId,pro.product as name, SUM(pro.quantity) as Inward   from  product_purchase_master pro  where pro.createdDate BETWEEN '" + fdayYear + "' AND '" + currentDate + "'   GROUP BY productID  "

        }
      } else { 
        val = "SELECT pro.productID as productId,pro.product as name, SUM(pro.quantity) as Inward   from  product_purchase_master pro  GROUP BY productID  "

      }
    }
  
    connection.query( 
      val,
      // "SELECT   pro.productID as productId,pro.product as name, SUM(pro.quantity) as Inward   from  product_purchase_master pro  where pro.createdDate BETWEEN '" + startDate + "' AND '" + endDate + "'   GROUP BY productID  ",
      (err, results, fields) => {
        // connection.release();
        responseVal = 1 
        if (err) {
          console.log("Error: " + err.message);
        }
        connection.query(
          "SELECT  * FROM `sales_product_service` ",
          (err, results1, fields) => {
            connection.release();
            responseVal = 1
            if (err) {
              console.log("Error: " + err.message);
            }

            results.forEach(element => {
              var sub = results1.filter(x => JSON.parse(x.productID) === JSON.parse(element.productId));

              var sum = 0
              if (sub != 0) {
                for (var i = 0; i < sub.length; i++) {
                  var cDate = new Date(sub[i].createdDate).toISOString()
                  if (currentDate >= cDate && sub[i].productID == element.productId) {
                    sum = Number(sum) + Number(sub[i].quantity)
                    element.price = sub[i].unitPrice
                    element.Outward = sum
                  } else {
                    element.price = sub[i].unitPrice
                    element.Outward = sum;
                  } 
                }

              } else {
                element.Outward = 0;
              }

            });
            return cb(err, results)
          }
        )
        // return cb(err, results)
      }
    );
   
  });
}
 exports.getJobsByTechnicians = function (tech,cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      } 
      var val;
      if (tech== "" ) { 
        val = "SELECT * from `job_master`"
       }else{
         val = "SELECT * from `job_master` WHERE assignedTo = '"+tech+"'"
       }
      return connection.query(
        // "SELECT * from `job_master` WHERE assignedTo = ?",[tech],
        val,
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
  exports.getCustomerByDate = function (data,cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      var responseVal = 0
      var val; 
      var currentDate;
      if (data.start != null && data.end != null && data.start != "" && data.end != "" && data.start != undefined && data.end != undefined) {
  
        var startDate = Moment(data.start).format('YYYY-MM-DD hh:mm:ss');
        currentDate = Moment(data.end).format('YYYY-MM-DD 12:59:59');
        //      "SELECT   pro.productID as productId,pro.product as name, SUM(pro.quantity) as Inward   from  product_purchase_master pro where  pro.isActive = 'true'     GROUP BY productID  ",

        val = "SELECT  * from `job_master`  WHERE createdDate BETWEEN '" + startDate + "' AND '" + currentDate + "'"
        } else {
        if (data.label != null && data.label != "" && data.label != undefined) {
          var start = 1;
          var d = new Date;
          var day = d.getDay();
          var diff = d.getDate() - day + (start > day ? start - 7 : start);
          d.setDate(diff);
          var firstday = new Date(d.setDate(diff))
          var fDay = Moment(firstday).format('YYYY-MM-DD hh:mm:ss');
          var cDate = new Date()
          currentDate = Moment(cDate).format('YYYY-MM-DD 12:59:59'); 
  
          //For Month
  
          var offset = (new Date().getTimezoneOffset() / 60) * -1;
          var tmpDate = new Date(d.getTime() + offset);
          var y = tmpDate.getFullYear();
          var m = tmpDate.getMonth();
          var FDay = new Date(y, m, 1);
          var fmDay = Moment(FDay).format('YYYY-MM-DD hh:mm:ss');
  
          //For Year
  
          var dr = new Date(new Date().getFullYear(), 0, 1);
          var fdayYear = Moment(dr).format('YYYY-MM-DD hh:mm:ss');
          // var cDate=new Date()
          //For Quater
  
          var quter = Moment().startOf('quarter').format('YYYY-MM-DD hh:mm:ss');
  
          if (data.label.toLowerCase() == "thisweek") { 
            val = "SELECT * from  `job_master` WHERE  createdDate BETWEEN '" + fDay + "' AND '" + currentDate + "' "
           }
          if (data.label.toLowerCase() == "thismonth") {
             val = "SELECT * from  `job_master` WHERE  createdDate BETWEEN '" + fmDay + "' AND '" + currentDate + "' "
  
          }
          if (data.label.toLowerCase() == "thisquater") {
             val = "SELECT * from  `job_master` WHERE  createdDate BETWEEN '" + quter + "' AND '" + currentDate + "' "
  
          }
          if (data.label.toLowerCase() == "thisyear") {
             val = "SELECT * from  `job_master` WHERE  createdDate BETWEEN '" + fdayYear + "' AND '" + currentDate + "' " 
          }
        } else { 
          val = "SELECT * from  `job_master` " 
        }
      }
    
        connection.query( 
        "SELECT  * FROM `customer_master` ",
         (err, results, fields) => {
          // connection.release(); 
          if (err) {
            console.log("Error: " + err.message);
          } 
          connection.query(
           val,
            (err, results1, fields) => {
              connection.release(); 
              if (err) {
                console.log("Error: " + err.message);
              }
             var list = []
             var sub = []
              results.forEach(val => {  
                sub = results1.filter(x => JSON.parse(x.customerID) === JSON.parse(val.id));
                if(sub.length != 0){

               
                var sum = 0;
                var totalSpent = 0;
                sub.forEach(val1 => {
                  
                  
                  if (Number(val1.customerID) == val.id) {
                    sum ++
                    totalSpent = Number(totalSpent) + Number(val1.price)
                    val.jobs = sum
                    val.moneySpent = totalSpent
                    val.customer = val1.customer;
                    val.avgPrice = Number(totalSpent) / Number(sum) 
                    
                    
                  } 
                  // sum = Number(val.quantity) - Number(val1.quantity)   
              
                });
                list.push(val)
              }else{
                sub = []
              }
              }); 
            
              return cb(err, list)
            }
          )
          // return cb(err, results)
        }
      );
     
    });
  };
  exports.getPartsByDate = function (data,cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      var responseVal = 0
      var val; 
      var currentDate;
      if (data.start != null && data.end != null && data.start != "" && data.end != "" && data.start != undefined && data.end != undefined) {
  
        var startDate = Moment(data.start).format('YYYY-MM-DD hh:mm:ss');
        currentDate = Moment(data.end).format('YYYY-MM-DD 12:59:59');
        //      "SELECT   pro.productID as productId,pro.product as name, SUM(pro.quantity) as Inward   from  product_purchase_master pro where  pro.isActive = 'true'     GROUP BY productID  ",

        val = "SELECT  * from `sales_product_service`  WHERE createdDate BETWEEN '" + startDate + "' AND '" + currentDate + "'"
        } else {
        if (data.label != null && data.label != "" && data.label != undefined) {
          var start = 1;
          var d = new Date;
          var day = d.getDay();
          var diff = d.getDate() - day + (start > day ? start - 7 : start);
          d.setDate(diff);
          var firstday = new Date(d.setDate(diff))
          var fDay = Moment(firstday).format('YYYY-MM-DD hh:mm:ss');
          var cDate = new Date()
          currentDate = Moment(cDate).format('YYYY-MM-DD 12:59:59'); 
  
          //For Month
  
          var offset = (new Date().getTimezoneOffset() / 60) * -1;
          var tmpDate = new Date(d.getTime() + offset);
          var y = tmpDate.getFullYear();
          var m = tmpDate.getMonth();
          var FDay = new Date(y, m, 1);
          var fmDay = Moment(FDay).format('YYYY-MM-DD hh:mm:ss');
  
          //For Year
  
          var dr = new Date(new Date().getFullYear(), 0, 1);
          var fdayYear = Moment(dr).format('YYYY-MM-DD hh:mm:ss');
          // var cDate=new Date()
          //For Quater
  
          var quter = Moment().startOf('quarter').format('YYYY-MM-DD hh:mm:ss');
  
          if (data.label.toLowerCase() == "thisweek") { 
            val = "SELECT * from  `sales_product_service` WHERE  createdDate BETWEEN '" + fDay + "' AND '" + currentDate + "' "
           }
          if (data.label.toLowerCase() == "thismonth") {
             val = "SELECT * from  `sales_product_service` WHERE  createdDate BETWEEN '" + fmDay + "' AND '" + currentDate + "' "
  
          }
          if (data.label.toLowerCase() == "thisquater") {
             val = "SELECT * from  `sales_product_service` WHERE  createdDate BETWEEN '" + quter + "' AND '" + currentDate + "' "
  
          }
          if (data.label.toLowerCase() == "thisyear") {
             val = "SELECT * from  `sales_product_service` WHERE  createdDate BETWEEN '" + fdayYear + "' AND '" + currentDate + "' " 
          }
        } else { 
          val = "SELECT * from  `sales_product_service` " 
        }
      }
    
        connection.query( 
        "SELECT  * FROM `product_master` ",
         (err, results, fields) => {
          // connection.release(); 
          if (err) {
            console.log("Error: " + err.message);
          } 
          connection.query(
           val,
            (err, results1, fields) => {
              connection.release(); 
              if (err) {
                console.log("Error: " + err.message);
              }
             var list = []
             var sub = []
              results.forEach(val => {  
                sub = results1.filter(x => JSON.parse(x.productID) === JSON.parse(val.id));
                if(sub.length != 0){ 
               
                var sum = 0; 
                sub.forEach(val1 => { 
                  
                  if (Number(val1.productID) == val.id) {
                    sum ++ 
                    val.totalRepair = sum   
                  }  
              
                });
                list.push(val)
              }else{
                sub = []
              }
              }); 
            
              return cb(err, list)
            }
          )
          // return cb(err, results)
        }
      );
     
    });
  };
  exports.getInvoiceByDate = function (data,cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      var val; 
      var currentDate;
      if (data.start != null && data.end != null && data.start != "" && data.end != "" && data.start != undefined && data.end != undefined) {
  
        var startDate = Moment(data.start).format('YYYY-MM-DD hh:mm:ss');
        currentDate = Moment(data.end).format('YYYY-MM-DD 12:59:59');
        //      "SELECT   pro.productID as productId,pro.product as name, SUM(pro.quantity) as Inward   from  product_purchase_master pro where  pro.isActive = 'true'     GROUP BY productID  ",

        val = "SELECT  * from `invoice_transaction`  WHERE createdDate BETWEEN '" + startDate + "' AND '" + currentDate + "'"
        } else {
        if (data.label != null && data.label != "" && data.label != undefined) {
          var start = 1;
          var d = new Date;
          var day = d.getDay();
          var diff = d.getDate() - day + (start > day ? start - 7 : start);
          d.setDate(diff);
          var firstday = new Date(d.setDate(diff))
          var fDay = Moment(firstday).format('YYYY-MM-DD hh:mm:ss');
          var cDate = new Date()
          currentDate = Moment(cDate).format('YYYY-MM-DD 12:59:59'); 
  
          //For Month
  
          var offset = (new Date().getTimezoneOffset() / 60) * -1;
          var tmpDate = new Date(d.getTime() + offset);
          var y = tmpDate.getFullYear();
          var m = tmpDate.getMonth();
          var FDay = new Date(y, m, 1);
          var fmDay = Moment(FDay).format('YYYY-MM-DD hh:mm:ss');
  
          //For Year
  
          var dr = new Date(new Date().getFullYear(), 0, 1);
          var fdayYear = Moment(dr).format('YYYY-MM-DD hh:mm:ss');
          // var cDate=new Date()
          //For Quater
  
          var quter = Moment().startOf('quarter').format('YYYY-MM-DD hh:mm:ss');
  
          if (data.label.toLowerCase() == "thisweek") { 
            val = "SELECT * from  `invoice_transaction` WHERE  createdDate BETWEEN '" + fDay + "' AND '" + currentDate + "' "
           }
          if (data.label.toLowerCase() == "thismonth") {
             val = "SELECT * from  `invoice_transaction` WHERE  createdDate BETWEEN '" + fmDay + "' AND '" + currentDate + "' "
  
          }
          if (data.label.toLowerCase() == "thisquater") {
             val = "SELECT * from  `invoice_transaction` WHERE  createdDate BETWEEN '" + quter + "' AND '" + currentDate + "' "
  
          }
          if (data.label.toLowerCase() == "thisyear") {
             val = "SELECT * from  `invoice_transaction` WHERE  createdDate BETWEEN '" + fdayYear + "' AND '" + currentDate + "' " 
          }
        } else { 
          val = "SELECT * from  `invoice_transaction` " 
        }
      }
    
      return connection.query( 
       val,
         (err, results, fields) => {
          connection.release();
          if (err) {
            console.log("Error: " + err.message);
          } 
          // connection.query(
          //  val,
          //   (err, results1, fields) => {
          //     connection.release();
          //     if (err) {
          //       console.log("Error: " + err.message);
          //     }
          //    var list = []
          //    var sub = []
          //     results.forEach(val => {  
          //       sub = results1.filter(x => JSON.parse(x.productID) === JSON.parse(val.id));
          //       if(sub.length != 0){ 
               
          //       var sum = 0; 
          //       sub.forEach(val1 => {
                  
                  
          //         if (Number(val1.productID) == val.id) {
          //           sum ++ 
          //           val.totalRepair = sum   
          //         }  
              
          //       });
          //       list.push(val)
          //     }else{
          //       sub = []
          //     }
          //     }); 
            
          //     return cb(err, list)
          //   }
          // )
          return cb(err, results)
        }
      );
    });
  };

  exports.getJobStatusByDate = function (data,cb) {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      
      var val; 
      var currentDate;
      if (data.start != null && data.end != null && data.start != "" && data.end != "" && data.start != undefined && data.end != undefined) {
  
        var startDate = Moment(data.start).format('YYYY-MM-DD hh:mm:ss');
        currentDate = Moment(data.end).format('YYYY-MM-DD 12:59:59');
        //      "SELECT   pro.productID as productId,pro.product as name, SUM(pro.quantity) as Inward   from  product_purchase_master pro where  pro.isActive = 'true'     GROUP BY productID  ",

        val = "SELECT COUNT(jobStatus) AS statusCount, jobStatus,  SUM(price) AS totalValue from `job_master`  WHERE createdDate BETWEEN '" + startDate + "' AND '" + currentDate + "' GROUP BY jobStatus"
        } else {
        if (data.label != null && data.label != "" && data.label != undefined) {
          var start = 1;
          var d = new Date;
          var day = d.getDay();
          var diff = d.getDate() - day + (start > day ? start - 7 : start);
          d.setDate(diff);
          var firstday = new Date(d.setDate(diff))
          var fDay = Moment(firstday).format('YYYY-MM-DD hh:mm:ss');
          var cDate = new Date()
          currentDate = Moment(cDate).format('YYYY-MM-DD 12:59:59'); 
  
          //For Month
  
          var offset = (new Date().getTimezoneOffset() / 60) * -1;
          var tmpDate = new Date(d.getTime() + offset);
          var y = tmpDate.getFullYear();
          var m = tmpDate.getMonth();
          var FDay = new Date(y, m, 1);
          var fmDay = Moment(FDay).format('YYYY-MM-DD hh:mm:ss');
  
          //For Year
  
          var dr = new Date(new Date().getFullYear(), 0, 1);
          var fdayYear = Moment(dr).format('YYYY-MM-DD hh:mm:ss');
          // var cDate=new Date()
          //For Quater
  
          var quter = Moment().startOf('quarter').format('YYYY-MM-DD hh:mm:ss');
  
          if (data.label.toLowerCase() == "thisweek") { 
            val = "SELECT  COUNT(jobStatus) AS statusCount,jobStatus,  SUM(price) AS totalValue from  `job_master` WHERE  createdDate BETWEEN '" + fDay + "' AND '" + currentDate + "' GROUP BY jobStatus"
           }
          if (data.label.toLowerCase() == "thismonth") {
             val = "SELECT COUNT(jobStatus) AS statusCount, jobStatus,  SUM(price) AS totalValue from  `job_master` WHERE  createdDate BETWEEN '" + fmDay + "' AND '" + currentDate + "' GROUP BY jobStatus"
  
          }
          if (data.label.toLowerCase() == "thisquater") {
             val = "SELECT COUNT(jobStatus) AS statusCount, jobStatus,  SUM(price) AS totalValue from  `job_master` WHERE  createdDate BETWEEN '" + quter + "' AND '" + currentDate + "' GROUP BY jobStatus"
  
          }
          if (data.label.toLowerCase() == "thisyear") {
             val = "SELECT COUNT(jobStatus) AS statusCount,  jobStatus,  SUM(price) AS totalValue from  `job_master` WHERE  createdDate BETWEEN '" + fdayYear + "' AND '" + currentDate + "' GROUP BY jobStatus" 
          }
        } else { 
          val = "SELECT COUNT(jobStatus) AS statusCount,jobStatus,  SUM(price) AS totalValue from  `job_master` GROUP BY jobStatus" 
        }
      }
    
      return connection.query( 
       val,
         (err, results, fields) => {
          connection.release();
          if (err) {
            console.log("Error: " + err.message);
          } 
          // connection.query(
          //  val,
          //   (err, results1, fields) => {
          //     connection.release();
          //     if (err) {
          //       console.log("Error: " + err.message);
          //     }
          //    var list = []
          //    var sub = []
          //     results.forEach(val => {  
          //       sub = results1.filter(x => JSON.parse(x.productID) === JSON.parse(val.id));
          //       if(sub.length != 0){ 
               
          //       var sum = 0; 
          //       sub.forEach(val1 => {
                  
                  
          //         if (Number(val1.productID) == val.id) {
          //           sum ++ 
          //           val.totalRepair = sum   
          //         }  
              
          //       });
          //       list.push(val)
          //     }else{
          //       sub = []
          //     }
          //     }); 
            
          //     return cb(err, list)
          //   }
          // )
          return cb(err, results)
        }
      );
    });
  };

  exports.getAllDashboardCounts = function (data, cb) {


    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      var responseVal = 0
      var val;
      var val1;
      var val2;
      var val3;
      var val4;
      var val5;
      var val6;
      var val7;
  
      if (data.start != null && data.end != null && data.start != "" && data.end != "" && data.start != undefined && data.end != undefined) {
  
        var startDate = Moment(data.start).format('YYYY-MM-DD hh:mm:ss');
        var endDate = Moment(data.end).format('YYYY-MM-DD 12:59:59');
  
        val = "SELECT COUNT(*) as alljobsCount from `job_master` WHERE createdDate BETWEEN '" + startDate + "' AND '" + endDate + "' "
        val1 = "SELECT COUNT(*) as jobsCompleted from `job_master` WHERE jobStatus='completed' AND (createdDate BETWEEN '" + startDate + "' AND '" + endDate + "')"
        val2 = "SELECT COUNT(*) as jobsReturned from `job_master` WHERE statusStage='returned' AND (createdDate BETWEEN '" + startDate + "' AND '" + endDate + "')"
        val3 = "SELECT COUNT(*) as jobsOpen from `job_master` WHERE jobStatus='pending' AND (createdDate BETWEEN '" + startDate + "' AND '" + endDate + "') "
        val4 = "SELECT SUM(price) as totalIncome from `job_master` WHERE createdDate BETWEEN '" + startDate + "' AND '" + endDate + "'"
        val5 = "SELECT  AVG(price) as avgPrice from `job_master` WHERE jobStatus='completed' AND (createdDate BETWEEN '" + startDate + "' AND '" + endDate + "')"
        val6 = "SELECT AVG(DATEDIFF(completedDate,createdDate)) as avgDays from `job_master` WHERE  createdDate BETWEEN '" + startDate + "' AND '" + endDate + "'"
        val7 = "SELECT  COUNT(*) as lateJobs from `job_master` WHERE completedDate > estDate AND (createdDate BETWEEN '" + startDate + "' AND '" + endDate + "')"
      } else {
        if (data.label != null && data.label != "" && data.label != undefined) {
          var start = 1;
          var d = new Date;
          var day = d.getDay();
          var diff = d.getDate() - day + (start > day ? start - 7 : start);
          d.setDate(diff);
          var firstday = new Date(d.setDate(diff))
          var fDay = Moment(firstday).format('YYYY-MM-DD hh:mm:ss');
          var cDate = new Date()
          var currentDate = Moment(cDate).format('YYYY-MM-DD 12:59:59');
  
  
          //For Month
  
          var offset = (new Date().getTimezoneOffset() / 60) * -1;
          var tmpDate = new Date(d.getTime() + offset);
          var y = tmpDate.getFullYear();
          var m = tmpDate.getMonth();
          var FDay = new Date(y, m, 1);
          var fmDay = Moment(FDay).format('YYYY-MM-DD hh:mm:ss');
  
          //For Year
  
          var dr = new Date(new Date().getFullYear(), 0, 1);
          var fdayYear = Moment(dr).format('YYYY-MM-DD hh:mm:ss');
          // var cDate=new Date()
          //For Quater
  
          var quter = Moment().startOf('quarter').format('YYYY-MM-DD hh:mm:ss');
  
          if (data.label.toLowerCase() == "thisweek") {
            val = "SELECT COUNT(*) as alljobsCount from `job_master`  WHERE  isActive='true' AND (createdDate BETWEEN '" + fDay + "' AND '" + currentDate + "')"
            val1 = "SELECT COUNT(*) as jobsCompleted from `job_master` WHERE jobStatus='completed' AND isActive='true' AND  (createdDate BETWEEN '" + fDay + "' AND '" + currentDate + "')"
            val2 = "SELECT COUNT(*) as jobsReturned from `job_master` WHERE statusStage='returned' AND isActive='true' AND  (createdDate BETWEEN '" + fDay + "' AND '" + currentDate + "')"
            val3 = "SELECT COUNT(*) as jobsOpen from `job_master` WHERE statusStage='open'   AND isActive='true' AND  (createdDate BETWEEN '" + fDay + "' AND '" + currentDate + "')"
            val4 = "SELECT SUM(price) as totalIncome from `job_master`  WHERE isActive='true' AND   (createdDate BETWEEN '" + fDay + "' AND '" + currentDate + "')"
            val5 = "SELECT  AVG(price) as avgPrice from `job_master` WHERE jobStatus='completed'  AND isActive='true' AND  (createdDate BETWEEN '" + fDay + "' AND '" + currentDate + "')"
            val6 = "SELECT AVG(DATEDIFF(completedDate,createdDate)) as avgDays from `job_master` WHERE isActive='true' AND  (createdDate BETWEEN '" + fDay + "' AND '" + currentDate + "')"
            val7 = "SELECT  COUNT(*) as lateJobs from `job_master` WHERE completedDate > estDate AND  (createdDate BETWEEN '" + fDay + "' AND '" + currentDate + "')"
          }
          if (data.label.toLowerCase() == "thismonth") {
            val = "SELECT COUNT(*) as alljobsCount from `job_master`  WHERE isActive='true' AND  (createdDate BETWEEN '" + fmDay + "' AND '" + currentDate + "' ) "
            val1 = "SELECT COUNT(*) as jobsCompleted from `job_master` WHERE jobStatus='completed' AND isActive='true' AND  (createdDate BETWEEN '" + fmDay + "' AND '" + currentDate + "')"
            val2 = "SELECT COUNT(*) as jobsReturned from `job_master` WHERE statusStage='returned' AND isActive='true' AND  (createdDate BETWEEN '" + fmDay + "' AND '" + currentDate + "')"
            val3 = "SELECT COUNT(*) as jobsOpen from `job_master` WHERE statusStage='open'   AND isActive='true' AND  (createdDate BETWEEN '" + fmDay + "' AND '" + currentDate + "')"
            val4 = "SELECT SUM(price) as totalIncome from `job_master`  WHERE isActive='true' AND  (createdDate BETWEEN '" + fmDay + "' AND '" + currentDate + "' )"
            val5 = "SELECT  AVG(price) as avgPrice from `job_master` WHERE jobStatus='completed'  AND isActive='true' AND  (createdDate BETWEEN '" + fmDay + "' AND '" + currentDate + "')"
            val6 = "SELECT AVG(DATEDIFF(completedDate,createdDate)) as avgDays from `job_master` WHERE isActive='true' AND  (createdDate BETWEEN '" + fmDay + "' AND '" + currentDate + "')"
            val7 = "SELECT  COUNT(*) as lateJobs from `job_master` WHERE completedDate > estDate AND isActive='true' AND  (createdDate BETWEEN '" + fmDay + "' AND '" + currentDate + "')"
  
          }
          if (data.label.toLowerCase() == "thisquater") {
            val = "SELECT COUNT(*) as alljobsCount from `job_master`  WHERE isActive='true' AND  (createdDate BETWEEN '" + quter + "' AND '" + currentDate + "')"
            val1 = "SELECT COUNT(*) as jobsCompleted from `job_master` WHERE jobStatus='completed' AND isActive='true' AND  (createdDate BETWEEN '" + quter + "' AND '" + currentDate + "')"
            val2 = "SELECT COUNT(*) as jobsReturned from `job_master` WHERE statusStage='returned' AND isActive='true' AND  (createdDate BETWEEN '" + quter + "' AND '" + currentDate + "')"
            val3 = "SELECT COUNT(*) as jobsOpen from `job_master` WHERE statusStage='open'   AND isActive='true' AND  (createdDate BETWEEN '" + quter + "' AND '" + currentDate + "')"
            val4 = "SELECT SUM(price) as totalIncome from `job_master`  WHERE isActive='true' AND  (createdDate BETWEEN '" + quter + "' AND '" + currentDate + "' )"
            val5 = "SELECT  AVG(price) as avgPrice from `job_master` WHERE jobStatus='completed'  AND isActive='true' AND  (createdDate BETWEEN '" + quter + "' AND '" + currentDate + "')"
            val6 = "SELECT AVG(DATEDIFF(completedDate,createdDate)) as avgDays from `job_master` WHERE isActive='true' AND  (createdDate BETWEEN '" + quter + "' AND '" + currentDate + "')"
            val7 = "SELECT  COUNT(*) as lateJobs from `job_master` WHERE completedDate > estDate AND isActive='true' AND  (createdDate BETWEEN '" + quter + "' AND '" + currentDate + "')"
  
          }
          if (data.label.toLowerCase() == "thisyear") {
            val = "SELECT COUNT(*) as alljobsCount from `job_master`  WHERE isActive='true' AND  (createdDate BETWEEN '" + fdayYear + "' AND '" + currentDate + "' ) "
            val1 = "SELECT COUNT(*) as jobsCompleted from `job_master` WHERE jobStatus='completed' AND isActive='true' AND  (createdDate BETWEEN '" + fdayYear + "' AND '" + currentDate + "')"
            val2 = "SELECT COUNT(*) as jobsReturned from `job_master` WHERE statusStage='returned' AND isActive='true' AND  (createdDate BETWEEN '" + fdayYear + "' AND '" + currentDate + "')  "
            val3 = "SELECT COUNT(*) as jobsOpen from `job_master` WHERE statusStage='open'  AND isActive='true' AND  (createdDate BETWEEN '" + fdayYear + "' AND '" + currentDate + "')"
            val4 = "SELECT SUM(price) as totalIncome from `job_master`  WHERE isActive='true' AND  (createdDate BETWEEN '" + fdayYear + "' AND '" + currentDate + "' )"
            val5 = "SELECT  AVG(price) as avgPrice from `job_master` WHERE jobStatus='completed'  AND isActive='true' AND  (createdDate BETWEEN '" + fdayYear + "' AND '" + currentDate + "')"
            val6 = "SELECT AVG(DATEDIFF(completedDate,createdDate)) as avgDays from `job_master` WHERE isActive='true' AND  (createdDate BETWEEN '" + fdayYear + "' AND '" + currentDate + "')"
            val7 = "SELECT  COUNT(*) as lateJobs from `job_master` WHERE completedDate > estDate AND isActive='true' AND  (createdDate BETWEEN '" + fdayYear + "' AND '" + currentDate + "')"
  
          }
        } else {
          val = "SELECT COUNT(*) as alljobsCount from `job_master` WHERE isActive='true'"
          val1 = "SELECT COUNT(*) as jobsCompleted from `job_master` WHERE jobStatus='completed' AND isActive='true'"
          val2 = "SELECT COUNT(*) as jobsReturned from `job_master` WHERE statusStage='returned' AND isActive='true'"
          val3 = "SELECT COUNT(*) as jobsOpen from `job_master` WHERE statusStage='open'  AND isActive='true' "
          val4 = "SELECT SUM(price) as totalIncome from `job_master` WHERE isActive='true'"
          val5 = "SELECT  AVG(price) as avgPrice from `job_master` WHERE jobStatus='completed' AND isActive='true'"
          val6 = "SELECT AVG(DATEDIFF(completedDate,createdDate)) as avgDays from `job_master` WHERE isActive='true'"
          val7 = "SELECT  COUNT(*) as lateJobs from `job_master` WHERE completedDate > estDate AND isActive='true'"
  
        }
      }
      var list = []
       connection.query(
        val,
        (err, result1, fields) => {
          // connection.release();
          responseVal = 1
          if (err) {
            console.log("Error: " + err.message);
          }
  
          // cb(err, results)
          connection.query(
            val1,
            (err, result2, fields) => {
              // connection.release();
              responseVal = 1
              if (err) {
                console.log("Error: " + err.message);
              }
  
              connection.query(
                val2,
                (err, result3, fields) => {
                  // connection.release();
                  responseVal = 1
                  if (err) {
                    console.log("Error: " + err.message);
                  }
                  // var total = Number(results[0].purchaseQty) - Number(results2[0].saleQty)
  
                  connection.query(
                    val3,
                    (err, result4, fields) => {
                      // connection.release();
                      responseVal = 1
                      if (err) {
                        console.log("Error: " + err.message);
                      }
                      connection.query(
                        val4,
                        (err, result5, fields) => {
                          // connection.release();
                          responseVal = 1
                          if (err) {
                            console.log("Error: " + err.message);
                          }
                          connection.query(
                            val5,
                            (err, result6, fields) => {
                              // connection.release();
                              responseVal = 1
                              if (err) {
                                console.log("Error: " + err.message);
                              }
                              connection.query(
                                val6,
                                (err, result7, fields) => {
                                  // connection.release();
                                  responseVal = 1
                                  if (err) {
                                    console.log("Error: " + err.message);
                                  }
                                  connection.query(
                                    val7,
                                    (err, result8, fields) => {
                                      connection.release();
                                      // responseVal = 1
                                      if (err) {
                                        console.log("Error: " + err.message);
                                      }
                                      var data = {
                                        alljobsCount: result1[0].alljobsCount,
                                        jobsCompleted: result2[0].jobsCompleted,
                                        jobsReturned: result3[0].jobsReturned,
                                        jobsOpen: result4[0].jobsOpen,
                                        totalIncome: result5[0].totalIncome,
                                        avgPrice: result6[0].avgPrice,
                                        avgDays: result7[0].avgDays,
                                        lateJobs: result8[0].lateJobs
                                      }
                                      if (data.alljobsCount != null && data.alljobsCount != 0) {
                                        var val = data.alljobsCount
                                        data.alljobsCount = val
                                      } else {
                                        data.alljobsCount = 0
                                      }
                                      if (data.jobsCompleted != null && data.jobsCompleted != 0) {
                                        var val = data.jobsCompleted
                                        data.jobsCompleted = val
                                      }
                                      else {
                                        data.jobsCompleted = 0
                                      }
                                      if (data.jobsReturned != null && data.jobsReturned != 0) {
                                        var val = data.jobsReturned
                                        data.jobsReturned = val
                                      }
                                      else {
                                        data.jobsReturned = 0
                                      }
                                      if (data.jobsOpen != null && data.jobsOpen != 0) {
                                        var val = data.jobsOpen
                                        data.jobsOpen = val
                                      }
                                      else {
                                        data.jobsOpen = 0
                                      }
                                      if (data.totalIncome != null && data.totalIncome != 0) {
                                        var val = data.totalIncome.toFixed(2);
                                        data.totalIncome = val
                                      }
                                      else {
                                        data.totalIncome = 0
                                      }
                                      if (data.avgPrice != null && data.avgPrice != 0) {
                                        var val = data.avgPrice.toFixed(2);
                                        data.avgPrice = val
                                      }
                                      else {
                                        data.avgPrice = 0
                                      }
                                      if (data.avgDays != null && data.avgDays != 0) {
                                        var val = data.avgDays
                                        data.avgDays = val
                                      }
                                      else {
                                        data.avgDays = 0
                                      }
                                      if (data.lateJobs != null && data.lateJobs != 0) {
                                        var val = data.lateJobs
                                        data.lateJobs = val
                                      } else {
                                        data.lateJobs = 0
                                      }
                                      list.push(data)
                                      return cb(err, list)
  
                                    }
                                  );
  
                                }
                              );
  
                            }
                          );
  
  
                        }
                      );
  
                    }
                  );
  
                }
              );
  
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
  
  exports.getAllDashboardPreviousCounts = function (data, cb) {
  
  
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Error: ' + err.message);
        return cb(err, null);
      }
      var responseVal = 0
      var val;
      var val1;
      var val2;
      var val3;
      var val4;
      var val5;
      var val6;
      var val7;
  
      if (data.start != null && data.end != null && data.start != "" && data.end != "" && data.start != undefined && data.end != undefined) {
         var sDate = new Date(data.start)
         var eDate = new Date(data.end)
       
        var prevMonthFirstDate = new Date(sDate.getFullYear() - (sDate.getMonth() > 0 ? 0 : 1), (sDate.getMonth() - 1 + 12) % 12, 1);
        // var prevMonthLastDate = new Date(eDate.getFullYear(), eDate.getMonth(), 0);
          var prevMonthLastDate = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 4300) 
  
        var startDate = Moment(prevMonthFirstDate).format('YYYY-MM-DD hh:mm:ss');
        var endDate = Moment(prevMonthLastDate).format('YYYY-MM-DD 12:59:59');
  
        val = "SELECT COUNT(*) as alljobsCount from `job_master` WHERE createdDate BETWEEN '" + startDate + "' AND '" + endDate + "' "
        val1 = "SELECT COUNT(*) as jobsCompleted from `job_master` WHERE jobStatus='completed' AND (createdDate BETWEEN '" + startDate + "' AND '" + endDate + "')"
        val2 = "SELECT COUNT(*) as jobsReturned from `job_master` WHERE statusStage='returned' AND (createdDate BETWEEN '" + startDate + "' AND '" + endDate + "')"
        val3 = "SELECT COUNT(*) as jobsOpen from `job_master` WHERE jobStatus='pending' AND (createdDate BETWEEN '" + startDate + "' AND '" + endDate + "') "
        val4 = "SELECT SUM(price) as totalIncome from `job_master` WHERE createdDate BETWEEN '" + startDate + "' AND '" + endDate + "'"
        val5 = "SELECT  AVG(price) as avgPrice from `job_master` WHERE jobStatus='completed' AND (createdDate BETWEEN '" + startDate + "' AND '" + endDate + "')"
        val6 = "SELECT AVG(DATEDIFF(completedDate,createdDate)) as avgDays from `job_master` WHERE  createdDate BETWEEN '" + startDate + "' AND '" + endDate + "'"
        val7 = "SELECT  COUNT(*) as lateJobs from `job_master` WHERE completedDate > estDate AND (createdDate BETWEEN '" + startDate + "' AND '" + endDate + "')"
      } else {
        if (data.label != null && data.label != "" && data.label != undefined) {
  
          var beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000)
          var SameDay = Moment(beforeOneWeek).format('YYYY-MM-DD')
            , day = beforeOneWeek.getDay()
            , diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -7 : 1)
            , firstMonday = new Date(beforeOneWeek.setDate(diffToMonday))
            , lastSunday = new Date(beforeOneWeek.setDate(diffToMonday + 5));
  
          var sDay = Moment(lastSunday).format('YYYY-MM-DD hh:mm:ss');
          var ffDay = Moment(firstMonday).format('YYYY-MM-DD hh:mm:ss'); 
  
          //For Month
          var beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 4400)
          var SameDay = Moment(beforeOneWeek).format('YYYY-MM-DD hh:mm:ss')
          var now = new Date();
          var prevMonthLastDate = new Date(now.getFullYear(), now.getMonth(), 0);
          var prevMonthFirstDate = new Date(now.getFullYear() - (now.getMonth() > 0 ? 0 : 1), (now.getMonth() - 1 + 12) % 12, 1);
  
  
  
          var fMDay = Moment(prevMonthFirstDate).format('YYYY-MM-DD hh:mm:ss');
          var ccDate = Moment(prevMonthLastDate).format('YYYY-MM-DD hh:mm:ss');
          //For Year
  
          var lastyear = new Date(new Date().getFullYear() - 1, 0, 1);
          var start = Moment(lastyear).format('YYYY-MM-DD hh:mm:ss');
          var end1 = (new Date(lastyear.getFullYear(), 11, 31))
          var end = Moment(end1).format('YYYY-MM-DD hh:mm:ss');
          // var cDate=new Date()
          //For Quater
          const today = new Date();
          const quarter = Math.floor((today.getMonth() / 3)); 
          var startFullQ =new Date(today.getFullYear()-1, quarter * 3 - 3, 1)  
          var endFullQ = new Date(startFullQ.getFullYear(), startFullQ.getMonth() + 3, 0)   
          var startFullQuarter = Moment(startFullQ).format('YYYY-MM-DD hh:mm:ss');
          var endFullQuarter = Moment(endFullQ).format('YYYY-MM-DD hh:mm:ss');
  
  
          if (data.label.toLowerCase() == "thisweek") {
            val = "SELECT COUNT(*) as alljobsCount from `job_master`  WHERE  isActive='true' AND (createdDate BETWEEN '" + ffDay + "' AND '" + sDay + "')"
            val1 = "SELECT COUNT(*) as jobsCompleted from `job_master` WHERE jobStatus='completed' AND isActive='true' AND  (createdDate BETWEEN '" + ffDay + "' AND '" + sDay + "')"
            val2 = "SELECT COUNT(*) as jobsReturned from `job_master` WHERE statusStage='returned' AND isActive='true' AND  (createdDate BETWEEN '" + ffDay + "' AND '" + sDay + "')"
            val3 = "SELECT COUNT(*) as jobsOpen from `job_master` WHERE statusStage='open'   AND isActive='true' AND  (createdDate BETWEEN '" + ffDay + "' AND '" + sDay + "')"
            val4 = "SELECT SUM(price) as totalIncome from `job_master`  WHERE isActive='true' AND   (createdDate BETWEEN '" + ffDay + "' AND '" + sDay + "')"
            val5 = "SELECT  AVG(price) as avgPrice from `job_master` WHERE jobStatus='completed'  AND isActive='true' AND  (createdDate BETWEEN '" + ffDay + "' AND '" + sDay + "')"
            val6 = "SELECT AVG(DATEDIFF(completedDate,createdDate)) as avgDays from `job_master` WHERE isActive='true' AND  (createdDate BETWEEN '" + ffDay + "' AND '" + sDay + "')"
            val7 = "SELECT  COUNT(*) as lateJobs from `job_master` WHERE completedDate > estDate AND  (createdDate BETWEEN '" + ffDay + "' AND '" + sDay + "')"
          }
          if (data.label.toLowerCase() == "thismonth") {
            val = "SELECT COUNT(*) as alljobsCount from `job_master`  WHERE isActive='true' AND  (createdDate BETWEEN '" + fMDay + "' AND '" + ccDate + "' ) "
            val1 = "SELECT COUNT(*) as jobsCompleted from `job_master` WHERE jobStatus='completed' AND isActive='true' AND  (createdDate BETWEEN '" + fMDay + "' AND '" + ccDate + "')"
            val2 = "SELECT COUNT(*) as jobsReturned from `job_master` WHERE statusStage='returned' AND isActive='true' AND  (createdDate BETWEEN '" + fMDay + "' AND '" + ccDate + "')"
            val3 = "SELECT COUNT(*) as jobsOpen from `job_master` WHERE statusStage='open'   AND isActive='true' AND  (createdDate BETWEEN '" + fMDay + "' AND '" + ccDate + "')"
            val4 = "SELECT SUM(price) as totalIncome from `job_master`  WHERE isActive='true' AND  (createdDate BETWEEN '" + fMDay + "' AND '" + ccDate + "' )"
            val5 = "SELECT  AVG(price) as avgPrice from `job_master` WHERE jobStatus='completed'  AND isActive='true' AND  (createdDate BETWEEN '" + fMDay + "' AND '" + ccDate + "')"
            val6 = "SELECT AVG(DATEDIFF(completedDate,createdDate)) as avgDays from `job_master` WHERE isActive='true' AND  (createdDate BETWEEN '" + fMDay + "' AND '" + ccDate + "')"
            val7 = "SELECT  COUNT(*) as lateJobs from `job_master` WHERE completedDate > estDate AND isActive='true' AND  (createdDate BETWEEN '" + fMDay + "' AND '" + ccDate + "')"
  
          }
          if (data.label.toLowerCase() == "thisquater") {
            val = "SELECT COUNT(*) as alljobsCount from `job_master`  WHERE isActive='true' AND  (createdDate BETWEEN '" + startFullQuarter + "' AND '" + endFullQuarter + "')"
            val1 = "SELECT COUNT(*) as jobsCompleted from `job_master` WHERE jobStatus='completed' AND isActive='true' AND  (createdDate BETWEEN '" + startFullQuarter + "' AND '" + endFullQuarter + "')"
            val2 = "SELECT COUNT(*) as jobsReturned from `job_master` WHERE statusStage='returned' AND isActive='true' AND  (createdDate BETWEEN '" + startFullQuarter + "' AND '" + endFullQuarter + "')"
            val3 = "SELECT COUNT(*) as jobsOpen from `job_master` WHERE statusStage='open'   AND isActive='true' AND  (createdDate BETWEEN '" + startFullQuarter + "' AND '" + endFullQuarter + "')"
            val4 = "SELECT SUM(price) as totalIncome from `job_master`  WHERE isActive='true' AND  (createdDate BETWEEN '" + startFullQuarter + "' AND '" + endFullQuarter + "' )"
            val5 = "SELECT  AVG(price) as avgPrice from `job_master` WHERE jobStatus='completed'  AND isActive='true' AND  (createdDate BETWEEN '" + startFullQuarter + "' AND '" + endFullQuarter + "')"
            val6 = "SELECT AVG(DATEDIFF(completedDate,createdDate)) as avgDays from `job_master` WHERE isActive='true' AND  (createdDate BETWEEN '" + startFullQuarter + "' AND '" + endFullQuarter + "')"
            val7 = "SELECT  COUNT(*) as lateJobs from `job_master` WHERE completedDate > estDate AND isActive='true' AND  (createdDate BETWEEN '" + startFullQuarter + "' AND '" + endFullQuarter + "')"
  
          }
          if (data.label.toLowerCase() == "thisyear") {
            val = "SELECT COUNT(*) as alljobsCount from `job_master`  WHERE isActive='true' AND  (createdDate BETWEEN '" + start + "' AND '" + end + "' ) "
            val1 = "SELECT COUNT(*) as jobsCompleted from `job_master` WHERE jobStatus='completed' AND isActive='true' AND  (createdDate BETWEEN '" + start + "' AND '" + end + "')"
            val2 = "SELECT COUNT(*) as jobsReturned from `job_master` WHERE statusStage='returned' AND isActive='true' AND  (createdDate BETWEEN '" + start + "' AND '" + end + "')  "
            val3 = "SELECT COUNT(*) as jobsOpen from `job_master` WHERE statusStage='open'  AND isActive='true' AND  (createdDate BETWEEN '" + start + "' AND '" + end + "')"
            val4 = "SELECT SUM(price) as totalIncome from `job_master`  WHERE isActive='true' AND  (createdDate BETWEEN '" + start + "' AND '" + end + "' )"
            val5 = "SELECT  AVG(price) as avgPrice from `job_master` WHERE jobStatus='completed'  AND isActive='true' AND  (createdDate BETWEEN '" + start + "' AND '" + end + "')"
            val6 = "SELECT AVG(DATEDIFF(completedDate,createdDate)) as avgDays from `job_master` WHERE isActive='true' AND  (createdDate BETWEEN '" + start + "' AND '" + end + "')"
            val7 = "SELECT  COUNT(*) as lateJobs from `job_master` WHERE completedDate > estDate AND isActive='true' AND  (createdDate BETWEEN '" + start + "' AND '" + end + "')"
  
          }
        } else {
          val = "SELECT COUNT(*) as alljobsCount from `job_master` WHERE isActive='true'"
          val1 = "SELECT COUNT(*) as jobsCompleted from `job_master` WHERE jobStatus='completed' AND isActive='true'"
          val2 = "SELECT COUNT(*) as jobsReturned from `job_master` WHERE statusStage='returned' AND isActive='true'"
          val3 = "SELECT COUNT(*) as jobsOpen from `job_master` WHERE statusStage='open'  AND isActive='true' "
          val4 = "SELECT SUM(price) as totalIncome from `job_master` WHERE isActive='true'"
          val5 = "SELECT  AVG(price) as avgPrice from `job_master` WHERE jobStatus='completed' AND isActive='true'"
          val6 = "SELECT AVG(DATEDIFF(completedDate,createdDate)) as avgDays from `job_master` WHERE isActive='true'"
          val7 = "SELECT  COUNT(*) as lateJobs from `job_master` WHERE completedDate > estDate AND isActive='true'"
  
        }
      }
      var list = []
      connection.query(
        val,
        (err, result1, fields) => {
          // connection.release();
          responseVal = 1
          if (err) {
            console.log("Error: " + err.message);
          }
  
          // cb(err, results)
          connection.query(
            val1,
            (err, result2, fields) => {
              // connection.release();
              responseVal = 1
              if (err) {
                console.log("Error: " + err.message);
              }
  
              connection.query(
                val2,
                (err, result3, fields) => {
                  // connection.release();
                  responseVal = 1
                  if (err) {
                    console.log("Error: " + err.message);
                  }
                  // var total = Number(results[0].purchaseQty) - Number(results2[0].saleQty)
  
                  connection.query(
                    val3,
                    (err, result4, fields) => {
                      // connection.release();
                      responseVal = 1
                      if (err) {
                        console.log("Error: " + err.message);
                      }
                      connection.query(
                        val4,
                        (err, result5, fields) => {
                          // connection.release();
                          responseVal = 1
                          if (err) {
                            console.log("Error: " + err.message);
                          }
                          connection.query(
                            val5,
                            (err, result6, fields) => {
                              // connection.release();
                              responseVal = 1
                              if (err) {
                                console.log("Error: " + err.message);
                              }
                              connection.query(
                                val6,
                                (err, result7, fields) => {
                                  // connection.release();
                                  responseVal = 1
                                  if (err) {
                                    console.log("Error: " + err.message);
                                  }
                                  connection.query(
                                    val7,
                                    (err, result8, fields) => {
                                      connection.release();
                                      // responseVal = 1
                                      if (err) {
                                        console.log("Error: " + err.message);
                                      }
                                      var data = {
                                        alljobsCountPre: result1[0].alljobsCount,
                                        jobsCompletedPre: result2[0].jobsCompleted,
                                        jobsReturnedPre: result3[0].jobsReturned,
                                        jobsOpenPre: result4[0].jobsOpen,
                                        totalIncomePre: result5[0].totalIncome,
                                        avgPricePre: result6[0].avgPrice,
                                        avgDaysPre: result7[0].avgDays,
                                        lateJobsPre: result8[0].lateJobs
                                      }
                                      if (data.alljobsCountPre != null && data.alljobsCountPre != 0) {
                                        var val = data.alljobsCountPre
                                        data.alljobsCountPre = val
                                      } else {
                                        data.alljobsCountPre = 0
                                      }
                                      if (data.jobsCompletedPre != null && data.jobsCompletedPre != 0) {
                                        var val = data.jobsCompletedPre
                                        data.jobsCompletedPre = val
                                      }
                                      else {
                                        data.jobsCompletedPre = 0
                                      }
                                      if (data.jobsReturnedPre != null && data.jobsReturnedPre != 0) {
                                        var val = data.jobsReturnedPre
                                        data.jobsReturnedPre = val
                                      }
                                      else {
                                        data.jobsReturnedPre = 0
                                      }
                                      if (data.jobsOpenPre != null && data.jobsOpenPre != 0) {
                                        var val = data.jobsOpenPre
                                        data.jobsOpenPre = val
                                      }
                                      else {
                                        data.jobsOpenPre = 0
                                      }
                                      if (data.totalIncomePre != null && data.totalIncomePre != 0) {
                                        var val = data.totalIncomePre.toFixed(2);
                                        data.totalIncomePre = val
                                      }
                                      else {
                                        data.totalIncomePre = 0
                                      }
                                      if (data.avgPricePre != null && data.avgPricePre != 0) {
                                        var val = data.avgPricePre.toFixed(2);
                                        data.avgPricePre = val
                                      }
                                      else {
                                        data.avgPricePre = 0
                                      }
                                      if (data.avgDaysPre != null && data.avgDaysPre != 0) {
                                        var val = data.avgDaysPre
                                        data.avgDaysPre = val
                                      }
                                      else {
                                        data.avgDaysPre = 0
                                      }
                                      if (data.lateJobsPre != null && data.lateJobsPre != 0) {
                                        var val = data.lateJobsPre
                                        data.lateJobsPre = val
                                      } else {
                                        data.lateJobsPre = 0
                                      }
                                      list.push(data)
                                      return cb(err, list)
  
                                    }
                                  );
  
                                }
                              );
  
                            }
                          );
  
  
                        }
                      );
  
                    }
                  );
  
                }
              );
  
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
  