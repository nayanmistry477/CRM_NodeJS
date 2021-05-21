var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var passport = require('passport');
var multer = require('multer');
let pdf = require("html-pdf"); 
var auth = require('../helpers/auth/jwt');
var guid = require('aguid');
var LocalStrategy = require('passport-local').Strategy;
var EmailSettings = require('../models/email-settings');
var generator = require('generate-password');
const nodemailer = require('nodemailer');
var fs = require("fs");
let ejs = require("ejs");
let path = require("path");
const utils = require("util");
const moment = require("moment");
const readFile = utils.promisify(fs.readFile);
var a = require('underscore');
var app = express();
app.set("view engine", "ejs");
const { ErrCode } = require('../constants');
const { NotFound, BadRequest, InternalServer, UnauthorizedAccess, StateConflict } = require('../helpers/error');
var secret = 'xyz';
const { EnvironmentObj } = require('../configs');
//Global Paths
var JOBSHEETPATH = './upload/Jobsheet/Jobsheet_'
var WORKSHEETPATH = './upload/Worksheet/Worksheet_'
var INVOICEPTH = "./upload/Invoice/Invoice_"

//Note -> Keep file:/// then put path logo
// var LOGOPATH ='file:///D:/CRM_Project/CRMAngular/src/assets/Capture.JPG'

//For third party email
var USERNAME=''
var PASSWORD=''

router.post('/createEmailSettings',
    (req, res, next) => {

        const errors = req.validationErrors();
        if (errors) {
            return next(new BadRequest(ErrCode.VALIDATION_FAILED, undefined, errors));
        }
        return next();
    },
    (req, res, next) => {
        passport.authenticate('jwt', {
            session: false,
        }, (err, user) => {

            const obj = req.body;
            const data = {
                fromAddress: obj.fromAddress,
                server: obj.server,
                password: obj.password,
                port: obj.port,
                username: obj.username,
                encryptiontype: obj.encryptiontype,
                isSSL: obj.isSSL,
                isActive: 'true',
                createdDate: new Date(),
                modifiedDate: new Date(),

            };
            EmailSettings.createEmailSettings(data,
                function (err, result1) {
                    if (err) {
                        //Database connection error
                        return res.json({
                            success: false,
                            data: {
                                status: 0,
                                message: err.message,
                                result1: []
                            },
                        });
                    }
                    if (result1 === undefined || result1 === null || result1.length == 0) {
                        return res.json({
                            success: true,
                            data: {
                                status: 0,
                                message: 'EmailSetting Update Failed',
                                result1: {}
                            },
                        });
                    }

                    return res.json({
                        success: true,
                        data: {
                            status: 1,
                            message: 'EmailSetting Updated successfully.',
                            result1
                        },
                    });
                });



        })(req, res, next);
    },
);
router.post('/updateEmailSettings',
    (req, res, next) => {

        const errors = req.validationErrors();
        if (errors) {
            return next(new BadRequest(ErrCode.VALIDATION_FAILED, undefined, errors));
        }
        return next();
    },
    (req, res, next) => {
        passport.authenticate('jwt', {
            session: false,
        }, (err, user) => {
            const nUser = req.body;
            EmailSettings.EmailSettings(nUser,
                function (err, result1) {
                    if (err) {
                        //Database connection error
                        return res.json({
                            success: false,
                            data: {
                                status: 0,
                                message: err.message,
                                result1: []
                            },
                        });
                    }
                    if (result1 === undefined || result1 === null || result1.length == 0) {
                        return res.json({
                            success: true,
                            data: {
                                status: 0,
                                message: 'Update EmailSetting Failed',
                                result1: {}
                            },
                        });
                    }

                    return res.json({
                        success: true,
                        data: {
                            status: 1,
                            message: 'EmailSetting Updated successfully.',
                            result1
                        },
                    });
                });

        })(req, res, next);
    },
);

// router.post('/deleteEmailSettings',
//     (req, res, next) => {

//         const errors = req.validationErrors();
//         if (errors) {
//             return next(new BadRequest(ErrCode.VALIDATION_FAILED, undefined, errors));
//         }
//         return next();
//     },
//     (req, res, next) => {
//         passport.authenticate('jwt', {
//             session: false,
//         }, (err, user) => { 
//                 const nUser = req.body; 
//                 EmailSettings.deleteEmailSettings(nUser,
//                     function (err, result1) {
//                         if (err) {
//                             //Database connection error
//                             return res.json({
//                                 success: false,
//                                 data: {
//                                     status: 0,
//                                     message: err.message,
//                                     result1: []
//                                 },
//                             });
//                         }
//                         if (result1 === undefined || result1 === null || result1.length == 0) {
//                             return res.json({
//                                 success: true,
//                                 data: {
//                                     status: 0,
//                                     message: 'EmailSetting Delete Failed',
//                                     result1: {}
//                                 },
//                             });
//                         }

//                         return res.json({
//                             success: true,
//                             data: {
//                                 status: 1,
//                                 message: 'EmailSetting Deleted successfully.',
//                                 result1
//                             },
//                         });
//                     }); 

//         })(req, res, next);
//     },
// );

router.get('/getAllEmailSettings',
    function (req, res, next) {

        passport.authenticate('jwt', { session: false }, function (err, user) {
            // console.log("in get users", user);
            if (!a.isEmpty(user) && !err) {

                //   var user_id = req.body;
                EmailSettings.getAllEmailSettings(function (err, result) {
                    if (err) {
                        return next(new InternalServer(ErrCode.DB_CONNECTION_ERROR, undefined, err.message));
                    }
                    if (result === undefined || result === null || result.length == 0) {
                        return res.json({
                            success: true,

                            status: 0,
                            message: 'not init',
                            result: []

                        });
                    }
                    return res.json({
                        success: true,
                        status: 1,
                        result

                    });
                })
            }

            else {
                // var err = new Error('User is not logged in');
                // return next(err);
                return res.json({
                    success: false,
                    data: {
                        status: 0,
                        message: err.message,
                        result: []
                    },
                });
            }
        })(req, res, next);
    }
);
var readHTMLFile = function (path, callback) {
    fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        } else {
            callback(null, html);
        }
    });
};
const pdfData = {
    data: {
        accompanying: "Charger,Battery",
        address: "27, Oxford Street, Millom, LA184LJ",
        assignedTo: "admin Admin",
        barcode: "",
        bookedBy: "Dwayen Johnson",
        brand: "Sony",
        completedDate: null,
        createdDate: "2021-03-19T04:59:02.000Z",
        customer: "Manthan Machhi",
        customerContact: 987456124,
        customerEmail: "snehal1@m2webdesignin",
        damageAsses: "",
        deposit: 0,
        discount: null,
        estDate: "2021-03-19T18:30:00.000Z",
        id: 2,
        isActive: "true",
        itemComment: "",
        itemType: "Laptop",
        jobId: "BMTS20213918",
        jobStatus: "completed",
        modifiedDate: "2021-03-23T10:09:28.000Z",
        password: "",
        price: 500,
        repairDescription: "",
        serialNo: "",
        storageLocation: "SHELF 4",
        underWarranty: "true",
    },
};
router.post('/sendMail',
    function (req, res, next) {

        passport.authenticate('jwt', { session: false },async function (err, user) {
            // console.log("in get users", user);
            if (!a.isEmpty(user) && !err) {

                var data = req.body
                data.invoiceDate = moment(data.invoiceDate).format('MMMM-DD-YYYY')
                // console.log("Invoice Data",data)
                const filePathName = path.resolve(__dirname, "invoice-email.ejs");
                const htmlString = fs.readFileSync(filePathName).toString();
                //  ejs.render(htmlString, data);
                const ejsData = ejs.render(htmlString, { data: data });


                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: data.username,
                        pass: data.password,
                    }
                });
                var mailOptions = {
                    from: data.username,
                    to: data.email,
                    subject: "Invoice",
                    html: ejsData,
                };


                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        return res.json({
                            message: "Mail has been sent",
                            status: 1
                        });
                        // console.log('Email sent: ' + info.response);
                    }
                });

            }

            else {
                // var err = new Error('User is not logged in');
                // return next(err);
                return res.json({
                    success: false,
                    data: {
                        status: 0,
                        message: err.message,
                        result: []
                    },
                });
            }
        })(req, res, next);
    }
);
router.post('/sendQuoteMail',
    function (req, res, next) {

        passport.authenticate('jwt', { session: false },async function (err, user) {
            // console.log("in get users", user);
            if (!a.isEmpty(user) && !err) {

                var data = req.body
                data.quotationDate = moment(data.quotationDate).format('MMMM-DD-YYYY')
                // console.log("Invoice Data",data)
                const filePathName = path.resolve(__dirname, "quote-email.ejs");
                const htmlString = fs.readFileSync(filePathName).toString();
                //  ejs.render(htmlString, data);
                const ejsData = ejs.render(htmlString, { data: data });


                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: data.username,
                        pass: data.password,
                    }
                });
                var mailOptions = {
                    from: data.username,
                    to: data.email,
                    subject: "Quotation",
                    html: ejsData,
                };


                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        return res.json({
                            message: "Mail has been sent",
                            status: 1
                        });
                        // console.log('Email sent: ' + info.response);
                    }
                });

            }

            else {
                // var err = new Error('User is not logged in');
                // return next(err);
                return res.json({
                    success: false,
                    data: {
                        status: 0,
                        message: err.message,
                        result: []
                    },
                });
            }
        })(req, res, next);
    }
);
router.post('/generateJobSheet',
    function (req, res, next) {

        passport.authenticate('jwt', { session: false }, async function (err, user) {
            // console.log("in get users", user);
            if (!a.isEmpty(user) && !err) {
                var data = req.body
            
                const filePathName = path.resolve(__dirname, "jobsheet.ejs");
                const htmlString = fs.readFileSync(filePathName).toString();

                let options = { format: "A4" };

                const pdfData = ejs.render(htmlString, { data: data });
                return pdf
                    .create(pdfData, options)
                    .toFile(EnvironmentObj.JOBSHEETPATH+ data.jobId + ".pdf",
                        (err, response) => {
                            if (err) return console.log(err);
                            else {
                                var filePath = EnvironmentObj.JOBSHEETPATH + data.jobId + ".pdf";
                                // var direName = path.resolve(__dirname)
                                // console.log(direName)
                                fs.readFile(  filePath, "utf8", function (err, data1) {
                                    res.contentType("application/pdf");
                                    
                                    // res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
                                    // res.send(data);
                                    // return res.json({
                                    //     success: true,
                                       
                                    //         status: 1,
                                    //         message: 'File Sent', 
                                    //         data
                                    // });

                                    res.send({
                                        status:1,
                                        data:"https://bmtechcrm.co.uk/sheets/Jobsheet/Jobsheet_"+data.jobId + ".pdf",
                                        message:'Jobsheet generated successfully', 
                                        // data:"F:/Nayan/nodejsAPI/"+filePath
                                    })

                                    // res.sendFile(data)
                                    // res.redirect("https://bmtechcrm.co.uk/sheets/Jobsheet/Jobsheet_"+data.jobId + ".pdf" )

                                });
                              

                             
                            }

                        }
                    );
            }

            else {
                // var err = new Error('User is not logged in');
                // return next(err);
                return res.json({
                    success: false,
                    data: {
                        status: 0,
                        message: err.message,
                        result: []
                    },
                });
            }
        })(req, res, next);
    }
);


router.post('/generateWorkSheet',
    function (req, res, next) {

        passport.authenticate('jwt', { session: false },async  function (err, user) {
            // console.log("in get users", user);
            if (!a.isEmpty(user) && !err) {
                var data = req.body
                data.pathVal = EnvironmentObj.LOGOPATH;
                const filePathName = path.resolve(__dirname, "worksheet.ejs");
                const htmlString = fs.readFileSync(filePathName).toString();

                let options = { format: "A4" };

                const pdfData = ejs.render(htmlString, { data: data });
                return  pdf
                    .create(pdfData, options)
                    .toFile(EnvironmentObj.WORKSHEETPATH + data.jobId + ".pdf",
                        (err, response) => {
                            if (err) return console.log(err);
                            else {
                                var filePath = EnvironmentObj.WORKSHEETPATH+ data.jobId + ".pdf";
                                var direName = path.resolve(__dirname) 
                                fs.readFile(  filePath, function (err, data1) {
                                    res.contentType("application/pdf");
                                    
                                    // res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
                                    // res.send(data);
                                    // return res.json({
                                    //     success: true,
                                       
                                    //         status: 1,
                                    //         message: 'File Sent', 
                                    //         data
                                    // });

                                    res.send({
                                        status:1,
                                        data:"https://bmtechcrm.co.uk/sheets/Worksheet/Worksheet_"+data.jobId+ ".pdf",
                                        message:'Worksheet generated successfully',
                                        // data:"F:/Nayan/nodejsAPI/"+filePath
                                    })

                                    // res.sendFile(data)
                                    // res.redirect("https://bmtechcrm.co.uk/sheets/Worksheet/Worksheet_"+data.jobId+ ".pdf" )
                                });
                              
                                //   res.redirect("https://dev.grabyourreviews.com/upload/upload.png")

                             
                            }

                        }
                    );
            }

            else {
                // var err = new Error('User is not logged in');
                // return next(err);
                return res.json({
                    success: false,
                    data: {
                        status: 0,
                        message: err.message,
                        result: []
                    },
                });
            }
        })(req, res, next);
    }
);

router.post('/openWorkSheet',
    function (req, res, next) {

        passport.authenticate('jwt', { session: false },async  function (err, user) {
            // console.log("in get users", user);
            if (!a.isEmpty(user) && !err) {
                var data = req.body
                var filePath = EnvironmentObj.WORKSHEETPATH+ data.jobId + ".pdf";
                var direName = path.resolve(__dirname) 
                fs.readFile(filePath, function (err, data1) {
                    res.contentType("application/pdf");
                     

                    res.send({
                        status:1,
                        data:"https://bmtechcrm.co.uk/sheets/Worksheet/Worksheet_"+data.jobId+ ".pdf",
                        // message:'Worksheet generated successfully',
                        // data:"F:/Nayan/nodejsAPI/"+filePath
                    }) 
                });
            }

            else {
                // var err = new Error('User is not logged in');
                // return next(err);
                return res.json({
                    success: false,
                    data: {
                        status: 0,
                        message: err.message,
                        result: []
                    },
                });
            }
        })(req, res, next);
    }
);

router.post('/generateInvoice',
    function (req, res, next) {

        passport.authenticate('jwt', { session: false }, async function (err, user) {
            // console.log("in get users", user);
            if (!a.isEmpty(user) && !err) {
                var data = req.body 
                const filePathName = path.resolve(__dirname, "invoice.ejs");
                const htmlString = fs.readFileSync(filePathName).toString();

                let options = { format: "A4" };

                const pdfData = ejs.render(htmlString, { data: data });
                return pdf
                    .create(pdfData, options)
                    .toFile(EnvironmentObj.INVOICEPTH+ data.invoiceID + ".pdf",
                        (err, response) => {
                            if (err) return console.log(err);
                            else {
                                var filePath = EnvironmentObj.INVOICEPTH + data.invoiceID + ".pdf";
                                // var direName = path.resolve(__dirname)
                                // console.log(direName)
                                fs.readFile( filePath, "utf8", function (err, data1) {
                                    res.contentType("application/pdf");
                                    
                                    // res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
                                    // res.send(data);
                                    // return res.json({
                                    //     success: true,
                                       
                                    //         status: 1,
                                    //         message: 'File Sent', 
                                    //         data
                                    // });

                                    res.send({
                                        status:1,
                                        data:"https://bmtechcrm.co.uk/sheets/Invoice/Invoice"+data.invoiceID+ ".pdf",
                                        message:'Invoice generated successfully', 
                                        // data:"F:/Nayan/nodejsAPI/"+filePath
                                    })
                                    // res.redirect("https://bmtechcrm.co.uk/sheets/Invoice/Invoice"+data.invoiceID+ ".pdf" )

                                    // res.sendFile(data)
                                });
                              
                                //   res.redirect("https://dev.grabyourreviews.com/upload/upload.png")

                             
                            }

                        }
                    );
            }

            else {
                // var err = new Error('User is not logged in');
                // return next(err);
                return res.json({
                    success: false,
                    data: {
                        status: 0,
                        message: err.message,
                        result: []
                    },
                });
            }
        })(req, res, next);
    }
);

router.post('/generateQuote',
    function (req, res, next) {

        passport.authenticate('jwt', { session: false }, async function (err, user) {
            // console.log("in get users", user);
            if (!a.isEmpty(user) && !err) {
                var data = req.body 
                const filePathName = path.resolve(__dirname, "quotation.ejs");
                const htmlString = fs.readFileSync(filePathName).toString();

                let options = { format: "A4" };

                const pdfData = ejs.render(htmlString, { data: data });
                return pdf
                    .create(pdfData, options)
                    .toFile(EnvironmentObj.QUOTEPTH+ data.quoteID + ".pdf",
                        (err, response) => {
                            if (err) return console.log(err);
                            else {
                                var filePath = EnvironmentObj.QUOTEPTH + data.quoteID + ".pdf";
                                // var direName = path.resolve(__dirname)
                                // console.log(direName)
                                fs.readFile( filePath, "utf8", function (err, data1) {
                                    res.contentType("application/pdf");
                                    
                                    // res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
                                    // res.send(data);
                                    // return res.json({
                                    //     success: true,
                                       
                                    //         status: 1,
                                    //         message: 'File Sent', 
                                    //         data
                                    // });

                                    res.send({
                                        status:1,
                                        data:"https://bmtechcrm.co.uk/sheets/Quotation/Quotation"+data.quoteID+ ".pdf",
                                        message:'Quotation generated successfully', 
                                        // data:"F:/Nayan/nodejsAPI/"+filePath
                                    })
                                    // res.redirect("https://bmtechcrm.co.uk/sheets/Invoice/Invoice"+data.invoiceID+ ".pdf" )

                                    // res.sendFile(data)
                                });
                              
                                //   res.redirect("https://dev.grabyourreviews.com/upload/upload.png")

                             
                            }

                        }
                    );
            }

            else {
                // var err = new Error('User is not logged in');
                // return next(err);
                return res.json({
                    success: false,
                    data: {
                        status: 0,
                        message: err.message,
                        result: []
                    },
                });
            }
        })(req, res, next);
    }
);
router.post('/generateStockreport',
    function (req, res, next) {

        passport.authenticate('jwt', { session: false },async  function (err, user) {
            // console.log("in get users", user);
            if (!a.isEmpty(user) && !err) {
                var data = req.body
                const filePathName = path.resolve(__dirname, "stock-report.ejs");
                const htmlString = fs.readFileSync(filePathName).toString();

                let options = { format: "A4" };

                const pdfData = ejs.render(htmlString, { data: data });
                return  pdf
                    .create(pdfData, options)
                    .toFile(EnvironmentObj.STOCKPATH + ".pdf",
                        (err, response) => {
                            if (err) return console.log(err);
                            else {
                                var filePath = EnvironmentObj.STOCKPATH+ ".pdf";
                                var direName = path.resolve(__dirname) 
                                fs.readFile( filePath, function (err, data) {
                                    res.contentType("application/pdf");
                                    
                                    // res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
                                    // res.send(data);
                                    // return res.json({
                                    //     success: true,
                                       
                                    //         status: 1,
                                    //         message: 'File Sent', 
                                    //         data
                                    // });

                                    res.send({
                                        status:1,
                                        data:"https://bmtechcrm.co.uk/sheets/Stockreport/Stockreport.pdf",
                                        message:'Stock report generated successfully',
                                        // data:"F:/Nayan/nodejsAPI/"+filePath
                                    })
                                    // res.redirect("https://bmtechcrm.co.uk/sheets/Stockreport/Stockreport.pdf" )

                                    // res.sendFile(data)
                                });
                              
                                //   res.redirect("https://dev.grabyourreviews.com/upload/upload.png")

                             
                            }

                        }
                    );
            }

            else {
                // var err = new Error('User is not logged in');
                // return next(err);
                return res.json({
                    success: false,
                    data: {
                        status: 0,
                        message: err.message,
                        result: []
                    },
                });
            }
        })(req, res, next);
    }
);
 
module.exports = router;