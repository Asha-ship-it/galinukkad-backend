const db = require('../_helper/db');
const Product = db.Product;
const UserLogins = db.UserLogins;
const Order = db.Order;
const fs = require("fs");
const PDFDocument = require("pdfkit");
let moment = require('moment');
var path = require('path')
const mongoose = require('mongoose');

var ROLES = require('../config.json').ROLES;
const puppeteer = require('puppeteer');
const excel = require('exceljs');
const Profile = db.Profile;
const Address = db.Address

// exports.productsReport = async (req, res, next) => {
//     try {
//         const data = await Product.find({}, { created_at: 1, is_active: 1, reviewcount: 1, description: 1, price: 1, _id: 0, title: 1 })
//             .sort({ created_at: 1 });
//         let doc = new PDFDocument;
//         generateHeader(doc);
//         generateInvoiceTable(doc, data);
//         var filePath = path.join(__dirname, '../public/');
//         const fileName = `Product-${Date.now()}.pdf`;
//         const fileUrl = filePath + fileName;
//         doc.pipe(fs.createWriteStream(fileUrl));
//         doc.end();
//         const downloadUrl = (req.protocol + '://' + req.get('host') + '/' + fileName);
//         return res.send({ status: true, data: { fileUrl: downloadUrl } });
//     } catch (e) {
//         res.send({ status: false, message: "Something went wrong!" });
//     }
// }


exports.getUsersReport = async (req, res, next) => {
    try {
        const reqBody = req.body;
        let Role = reqBody.role ? (reqBody.role).toUpperCase() : '';
        const reportType = reqBody.report_type ? (reqBody.report_type).toUpperCase() : '';
        const reportArray = ['PDF', 'EXCEL'];

        if (!reportType || !reportArray.includes(reportType)) {
            return res.send({ status: false, message: 'report_type is incorrect, please define correct report_type' });
        }

        if (Role && ROLES.includes(Role)) {
            Role = { roles: Role }
        } else if (Role && !ROLES.includes(Role)) {
            return res.send({ status: false, message: "Role is incorrect" });
        } else {
            Role = {};
        }

        const users = await UserLogins.aggregate([
            { $lookup: { from: 'profiles', localField: '_id', foreignField: "loginid", as: "profileInfo" } },
            { $unwind: { path: '$profileInfo', preserveNullAndEmptyArrays: true } },
            { $match: Role },
            {
                $project: {
                    '_id': 0,
                    'email': 1,
                    'username': 1,
                    'roles': 1,
                    'name': "$profileInfo.name",
                    'dob': "$profileInfo.dob",
                    'phone': "$profileInfo.phone",
                    'gender': "$profileInfo.gender"
                }
            },
        ]);

        if (reportType === 'PDF') {
            const usersHtml = path.resolve(__dirname, '../public/usersHtml.html');
            const usersPdf = path.resolve(__dirname, '../public/usersPdf.pdf');

            const columns =
                `<th>Email</th>
                <th>Usersname</th>
                <th>Role</th>
                <th>Name</th>
                <th>Date Of Birthday</th>
                <th>Phone Number</th>
                <th>Gender</th>`;
            const tableName = "Users List";
            getPdfdata(users, usersHtml, usersPdf, columns, tableName);
            const downloadUrl = (req.protocol + '://' + req.get('host') + '/usersPdf.pdf');

            return res.send({ status: true, data: { fileUrl: downloadUrl }, message: 'Users Pdf report get successfully' });

        } else if (reportType === 'EXCEL') {

            const reportInfo = {
                reportName: 'Users',
                arrayData: users,
                fileName: 'usersExcel.xlsx',
                columns: [
                    { header: 'Name', key: 'name', width: 20 },
                    { header: 'Email', key: 'email', width: 20 },
                    { header: 'Username', key: 'username', width: 20 },
                    { header: 'Role', key: 'roles', width: 35 },
                    { header: 'Date of Birth', key: 'dob', width: 20 },
                    { header: 'Phone', key: 'phone', width: 20 },
                    { header: 'Gender', key: 'gender', width: 20 }
                ]
            }

            const Report = await getExcelReport(reportInfo);

            if (Report.status) {
                const downloadUrl = (req.protocol + '://' + req.get('host') + '/' + reportInfo.fileName);
                return res.send({ status: true, data: { fileUrl: downloadUrl }, message: Report.message });
            } else {
                return res.send({ status: false, message: Report.message });
            }

        } else {
            return res.send({ status: false, message: 'Something went wrong when get report' });
        }

    } catch (error) {
        return res.send({ status: false, message: error.message });
    }
}


// exports.getOrderReport = async (req, res, next) => {
//     try {
//         const reqBody = req.body;
//         // let Role = reqBody.role ? (reqBody.role).toUpperCase() : '';
//         const reportType = reqBody.report_type ? (reqBody.report_type).toUpperCase() : '';
//         const reportArray = ['PDF', 'EXCEL'];

//         if (!reportType || !reportArray.includes(reportType)) {
//             return res.send({ status: false, message: 'report_type is incorrect, please define correct report_type' });
//         }

//         const dateFilter = reqBody.dateFilter ? reqBody.dateFilter : {};

//         const jsonStr = {};

//         if (dateFilter.from_date && dateFilter.to_date) {
//             jsonStr.create = { $gte: new Date(dateFilter.from_date), $lt: new Date(dateFilter.to_date) };
//         }

//         if (!isNaN(reqBody.status) && reqBody.status !== "") {
//             jsonStr.status = Number(reqBody.status);
//         }

//         let orderDetail = await Order.aggregate([
//             // { $lookup: { from: 'products', localField: 'return_productIds', foreignField: '_id', as: 'return_productIds' } },
//             // { $lookup: { from: 'products', localField: 'refund_productIds', foreignField: '_id', as: 'refund_productIds' } },
//             // { $lookup: { from: 'userlogins', localField: 'loginid', foreignField: '_id', as: 'userInfo' } },
//             // { $lookup: { from: 'addresses', localField: 'userInfo._id', foreignField: 'loginid', as: 'userAddressInfo' } },
//             // { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
//             // { $unwind: { path: '$userAddressInfo', preserveNullAndEmptyArrays: true } },
//             {
//                 $project: {
//                     _id: 0,
//                     product: 1,
//                     payment_method: 1,
//                     payment_status: 1, // 0 for not paid 1 for paid
//                     amount: {
//                         $ifNull: ['$amount', null]
//                     },
//                     status: 1,
//                     create: 1,
//                 }
//             },
//             { $match: jsonStr }
//         ]);

//         for (let i = 0; i < orderDetail.length; i++) {
//             const E = orderDetail[i];
//             let productIds = E.product ? E.product : [];
//             orderDetail[i]['products'] = [];
//             for (let j = 0; j < productIds.length; j++) {
//                 const Pdt = await Product.findById(mongoose.Types.ObjectId(productIds[j].id))
//                     .select('_id title price discount discounted_price');
//                 if (Pdt) {
//                     orderDetail[i]['products'].push({ title: Pdt.title, quantity: (productIds[j].quantity || 0) })
//                 }
//             }
//             orderDetail[i].payment_status = orderDetail[i].payment_status ? 'Paid' : 'Unpaid';

//             if (orderDetail[i].status == 0) {
//                 orderDetail[i].orderStatus = 'Placed';
//             } else if (orderDetail[i].status == 1) {
//                 orderDetail[i].orderStatus = 'Delivered';
//             } else if (orderDetail[i].status == 2) {
//                 orderDetail[i].orderStatus = 'Cancelled';
//             } else if (orderDetail[i].status == 3) {
//                 orderDetail[i].orderStatus = 'Returned';
//             } else if (orderDetail[i].status == 4) {
//                 orderDetail[i].orderStatus = 'Refund';
//             }

//             delete orderDetail[i].product;
//         }

//         // return res.send({ orderDetail })

//         if (reportType === 'PDF') {
//             const orderHtml = path.resolve(__dirname, '../public/orderHtml.html');
//             const orderPdf = path.resolve(__dirname, '../public/orderPdf.pdf');

//             const columns =
//                 `<th>Status</th>
//             <th>Created</th>
//             <th>Payment Method</th>
//             <th>Payment Status</th>
//             <th>Amount</th>
//             <th>Products</th>
//             <th>Order Status</th>`;
//             const tableName = "Orders List";

//             const orderArray = [];
//             orderDetail.forEach(E => {
//                 const json = {
//                     status: E.status,
//                     create: E.create,
//                     payment_method: E.payment_method,
//                     payment_status: E.payment_status,
//                     amount: E.amount,
//                     products: (E.products.map(x => x.title)).join(', '),
//                     orderStatus: E.orderStatus,
//                 }
//                 orderArray.push(json);
//             })

//             getPdfdata(orderArray, orderHtml, orderPdf, columns, tableName);
//             const downloadUrl = (req.protocol + '://' + req.get('host') + '/orderPdf.pdf');

//             return res.send({ status: true, data: { fileUrl: downloadUrl }, message: 'Orders pdf report get successfully' });

//         } else if (reportType === 'EXCEL') {

//             const reportInfo = {
//                 reportName: 'Orders',
//                 arrayData: orderDetail,
//                 fileName: 'ordersExcel.xlsx',
//                 columns: [
//                     { header: 'Products', key: 'products', width: 20 },
//                     { header: 'Status', key: 'status', width: 20 },
//                     { header: 'Order Status', key: 'orderStatus', width: 20 },
//                     { header: 'Payment Method', key: 'payment_method', width: 35 },
//                     { header: 'Payment Status', key: 'payment_status', width: 20 },
//                     { header: 'Amount', key: 'amount', width: 20 },
//                     { header: 'Created', key: 'create', width: 20 }
//                 ]
//             }

//             const Report = await getExcelReport(reportInfo);

//             if (Report.status) {
//                 const downloadUrl = (req.protocol + '://' + req.get('host') + '/' + reportInfo.fileName);
//                 return res.send({ status: true, data: { fileUrl: downloadUrl }, message: Report.message });
//             } else {
//                 return res.send({ status: false, message: Report.message });
//             }

//         } else {
//             return res.send({ status: false, message: 'Something went wrong when get report' });
//         }

//     } catch (error) {
//         return res.send({ status: false, message: error.message });
//     }
// }




function getPdfdata(ArrayData, createHTML, createPDF, HeadColumn, TableName) {

    const createRow = (item) => `
    <tr>
    ${Object.keys(item).map(function (key) {
        let obj = ``;
        if (key === `dob` || key === `create`) {
            obj = "<td>" + moment(item[key]).format('MM/DD/YYYY') + "</td>"
        } else {
            obj = "<td>" + item[key] + "</td>"
        }
        return obj;
    }).join("")}
    </tr>`;

    const createTable = (rows) => `
    <table>
      <tr> 
          ${HeadColumn}
      </tr>
      ${rows}
    </table>`;

    const createHtml = (table) => `
    <html>
      <head>
        <style>
          table {
            width: 100%;
          }
          tr {
            text-align: left;
            border: 1px solid black;
          }
          th, td {
            padding: 10px;
          }
          tr:nth-child(odd) {
            background: #CCC
          }
          tr:nth-child(even) {
            background: #FFF
          }
          .no-content {
            background-color: red;
          }
        </style>
      </head>
      <body>
      <h1>${TableName}</h1>
        ${table}
      </body>
    </html>
  `;

    const doesFileExist = (filePath) => {
        try {
            fs.statSync(filePath);
            return true;
        } catch (error) {
            return false;
        }
    };

    try {
        if (doesFileExist(createHTML)) {
            console.log('Deleting old build file');
            fs.unlinkSync(createHTML);
        }

        const rows = ArrayData.map(createRow).join('');
        const table = createTable(rows);
        const html = createHtml(table);
        fs.writeFileSync(createHTML, html);
        console.log('Succesfully created an HTML table');
    } catch (error) {
        console.log('Error generating table', error);
    }

    const printPdf = async () => {
        console.log('Starting: Generating PDF Process, Kindly wait ..');
        /** Launch a headleass browser */
        const browser = await puppeteer.launch();
        /* 1- Ccreate a newPage() object. It is created in default browser context. */
        const page = await browser.newPage();
        /* 2- Will open our generated `.html` file in the new Page instance. */
        await page.goto(createHTML, { waitUntil: 'networkidle0' });
        /* 3- Take a snapshot of the PDF */
        const pdf = await page.pdf();
        /* 4- Cleanup: close browser. */
        await browser.close();
        console.log('Ending: Generating PDF Process');
        return pdf;
    };

    const init = async () => {
        try {
            const pdf = await printPdf();
            fs.writeFileSync(createPDF, pdf);
            console.log('Succesfully created an PDF table');
        } catch (error) {
            console.log('Error generating PDF', error);
        }
    };
    init();
}

function getExcelReport(reportInfo) {
    try {

        const reportName = reportInfo.reportName;
        const arrayData = reportInfo.arrayData;
        const fileName = reportInfo.fileName;
        const columns = reportInfo.columns;


        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet(reportName);

        //  WorkSheet Header
        worksheet.columns = columns;

        // Add Array Rows
        worksheet.addRows(arrayData);

        var filePath = path.join(__dirname, '../public/');
        const fileUrl = filePath + fileName;

        return new Promise(async (resolve, reject) => {
            workbook.xlsx.writeFile(fileUrl)
                .then(function () {
                    // const imageUrl = (req.protocol + '://' + req.get('host') + '/' + fileName);
                    return resolve({ status: true, message: 'Excel Report get successfully' });
                }).catch((err) => {
                    return resolve({ status: false, message: err.message });
                });
        });
    } catch (error) {
        return ({ status: false, message: error.message });
    }
}












function generateHeader(doc) {
    doc
        .fillColor("#444444")
        .fontSize(20)
        .text("Product Reports", 50, 45)
        .moveDown();
}

function generateInvoiceTable(doc, invoice) {
    let i;
    const invoiceTableTop = 100;

    doc.font("Helvetica-Bold");
    generateTableRow(
        doc,
        invoiceTableTop,
        "Created Date",
        "Title",
        "Price",
        "Review",
    );
    generateHr(doc, invoiceTableTop + 20);
    doc.font("Helvetica");

    for (i = 0; i < invoice.length; i++) {
        const item = invoice[i];
        const position = invoiceTableTop + (i + 1) * 30;
        generateTableRow(
            doc,
            position,
            formatDate(item.created_at),
            item.title ? item.title : '---',
            item.price ? item.price : '---',
            item.reviewcount ? item.reviewcount : 0
        );

        generateHr(doc, position + 20);
    }
}

function generateTableRow(
    doc,
    y,
    item,
    description,
    unitCost,
    quantity,
    lineTotal
) {
    doc
        .fontSize(10)
        .text(item, 50, y)
        .text(description, 150, y)
        .text(unitCost, 280, y, { width: 90, align: "right" })
        .text(quantity, 370, y, { width: 90, align: "right" })
        .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
    doc
        .strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();
}

function formatCurrency(cents) {
    return "$" + (cents / 100).toFixed(2);
}

function formatDate(date) {
    const Date = date.getDate();
    const Month = date.getMonth();
    const Year = date.getFullYear();

    const fullDate = Date + '/' + (Month + 1) + '/' + Year;
    return fullDate;
}


exports.orderInvoiceReportGetAllOrders = async (req, res, next) => {
    try {
        const reqBody = req.body;
        const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
        const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;

        let orderDetail = await Order.aggregate([
            { $lookup: { from: 'addresses', localField: 'address_id', foreignField: '_id', as: 'address' } },
            { $unwind: { path: '$address', preserveNullAndEmptyArrays: true } },
            { $skip: (Limit * PageNo) },
            { $limit: Limit }
        ])

        if (orderDetail) {
            for (let i = 0; i < orderDetail.length; i++) {

                let productIds = [];
                if (orderDetail[i].product) {
                    productIds = (orderDetail[i].product).map(obj => obj['id'])
                }

                productIds = productIds.filter(x => x);

                let products = await Product.find({ id: { $in: productIds } })
                let can_give_feedback = 0;
                if (orderDetail[i].status === 1) {
                    can_give_feedback = 1
                }
                let is_order_refundable = 0
                let is_order_returnable = 0
                if (orderDetail[i].status === 3) {
                    is_order_returnable = 1
                } else if (orderDetail[i].status === 4) {
                    is_order_refundable = 1
                }

                orderDetail[i].products = products.length > 0 ? products : [];
                orderDetail[i].delivery_date = moment(orderDetail[i].created).add(7, 'days')
                orderDetail[i].can_give_feedback = can_give_feedback
                orderDetail[i].is_order_refundable = is_order_refundable
                orderDetail[i].is_order_returnable = is_order_returnable
            }

            res.send({ status: true, message: "Record fetched", result: orderDetail });
        } else {
            res.send({ status: false, message: "Record not found" });
        }

    } catch (e) {
        console.log(e);
        res.send({ status: false, message: ("Something went wrong!" || e.message) });
    }
}

exports.orderInvoiceForUser = async (req, res, next) => {
    try {

        if (!req.body._id) {
            return res.send({ status: false, message: "Order Id is required" });
        }

        let orderDetail = await Order.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(req.body._id) } },
            { $lookup: { from: 'addresses', localField: 'address_id', foreignField: '_id', as: 'address' } },
            { $lookup: { from: 'profiles', localField: 'loginid', foreignField: 'loginid', as: 'userInfo' } },
            { $unwind: { path: '$address', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
        ])

        if (orderDetail) {
            let doc = new PDFDocument;

            var filePath = path.join(__dirname, '../public/');
            const fileName = `Invoice-${Date.now()}.pdf`;
            const fileUrl = filePath + fileName;

            for (let i = 0; i < orderDetail.length; i++) {

                let productIds = [];
                if (orderDetail[i].product) {
                    productIds = (orderDetail[i].product).map(obj => obj['id'])
                }

                productIds = productIds.filter(x => x);

                let products = await Product.find({ _id: { $in: productIds } })

                orderDetail[i].products = products;
                orderDetail[i].delivery_date = moment(orderDetail[i].created).add(7, 'days')
            }

            generateInvoiceHeader(doc, orderDetail);
            generateInvoiceCustomerInformation(doc, orderDetail);
            generateInvoiceTableShow(doc, orderDetail);
            doc.pipe(fs.createWriteStream(fileUrl));
            doc.end();
            const downloadUrl = (req.protocol + '://' + req.get('host') + '/' + fileName);
            res.send({ status: true, message: "Record fetched", result: downloadUrl });
        } else {
            res.send({ status: false, message: "Record not found" });
        }

    } catch (e) {
        console.log(e);
        res.send({ status: false, message: (e.message || "Something went wrong!") });
    }
}

exports.ordersAdvanceReports = async (req, res, next) => {
    try {
        const reqBody = req.body;
        // let Role = reqBody.role ? (reqBody.role).toUpperCase() : '';
        const reportType = reqBody.report_type ? (reqBody.report_type).toUpperCase() : '';
        const reportArray = ['PDF', 'EXCEL'];

        if (!reportType || !reportArray.includes(reportType)) {
            return res.send({ status: false, message: 'report_type is incorrect, please define correct report_type' });
        }

        // Pagination
        const currentPage = reqBody.page ? Number(reqBody.page) : 0;
        const Limit = reqBody.limit ? Number(reqBody.limit) : 10;
        const skipRecord = currentPage * Limit;
        // Sorting
        const sortColumn = reqBody.sortColumn ? reqBody.sortColumn : '_id';
        const sortBy = reqBody.sortBy ? reqBody.sortBy : 'desc';
        // Query String
        const queryStr = reqBody.queryStr ? reqBody.queryStr : {};
        const filter = reqBody.filter ? new RegExp(reqBody.filter, 'i') : '';

        const MATCH = {};
        MATCH.$and = [];
        MATCH.$or = [];

        // for amount
        if (isValidArr(queryStr.amount, 2)) {
            MATCH.$and.push({ amount: { $gte: parseInt(queryStr.amount[0]), $lt: (parseInt(queryStr.amount[1]) + 1) } });
        }

        // for all search keyup
        if (filter) {
            MATCH.$or.push({ companyname: filter });
            MATCH.$or.push({ country: filter });
            MATCH.$or.push({ payment_method: filter });
            MATCH.$or.push({ description: filter });
            MATCH.$or.push({ shipping: filter });
        }

        const dateFilter = reqBody.dateFilter ? reqBody.dateFilter : {};


        if (dateFilter.from_date && dateFilter.to_date) {
            MATCH.$and.push({ create: { $gte: new Date(dateFilter.from_date), $lt: new Date(dateFilter.to_date) } });
        }

        if (!isNaN(reqBody.status) && reqBody.status !== "") {
            MATCH.$and.push({ status: Number(reqBody.status) });
        }

        if (!MATCH.$and.length) delete MATCH.$and;
        if (!MATCH.$or.length) delete MATCH.$or;

        const orderDetail = await Order.aggregate([
            { $sort: { [sortColumn]: (sortBy === 'asc' ? 1 : -1) } },
            { $skip: skipRecord },
            { $limit: Limit },
            {
                $project: {
                    _id: 0,
                    product: 1,
                    payment_method: 1,
                    payment_status: 1,
                    amount: {
                        $ifNull: ['$amount', null]
                    },
                    status: 1,
                    create: 1
                }
            },
            { $match: MATCH }
        ]);

        for (let i = 0; i < orderDetail.length; i++) {
            const E = orderDetail[i];

            let productIds = E.product ? E.product : [];
            orderDetail[i]['products'] = [];
            for (let j = 0; j < productIds.length; j++) {

                const Pdt = await Product.findById(mongoose.Types.ObjectId(productIds[j].id))
                    .select('_id title price discount discounted_price');

                if (Pdt) {

                    orderDetail[i]['products'].push({ title: Pdt.title, quantity: (productIds[j].quantity || 0) })
                }
            }
            orderDetail[i].payment_status = orderDetail[i].payment_status ? 'Paid' : 'Unpaid';

            if (orderDetail[i].status == 0) {
                orderDetail[i].orderStatus = 'Placed';
            } else if (orderDetail[i].status == 1) {
                orderDetail[i].orderStatus = 'Delivered';
            } else if (orderDetail[i].status == 2) {
                orderDetail[i].orderStatus = 'Cancelled';
            } else if (orderDetail[i].status == 3) {
                orderDetail[i].orderStatus = 'Returned';
            } else if (orderDetail[i].status == 4) {
                orderDetail[i].orderStatus = 'Refund';
            }

            delete orderDetail[i].product;
        }

        //   return res.send({ orderDetail })

        if (reportType === 'PDF') {
            const orderHtml = path.resolve(__dirname, '../public/orderHtml.html');
            const orderPdf = path.resolve(__dirname, '../public/orderPdf.pdf');

            const columns =
                `<th>Status</th>
            <th>Created</th>
            <th>Payment Method</th>
            <th>Payment Status</th>
            <th>Amount</th>
            <th>Products</th>
            <th>Order Status</th>`;
            const tableName = "Orders List";

            const orderArray = [];
            orderDetail.forEach(E => {
                const json = {
                    status: E.status,
                    create: E.create,
                    payment_method: E.payment_method,
                    payment_status: E.payment_status,
                    amount: E.amount,
                    products: (E.products.map(x => x.title)).join(', '),
                    orderStatus: E.orderStatus,
                }
                orderArray.push(json);
            })

            getPdfdata(orderArray, orderHtml, orderPdf, columns, tableName);
            const downloadUrl = (req.protocol + '://' + req.get('host') + '/orderPdf.pdf');

            return res.send({ status: true, data: { fileUrl: downloadUrl }, message: 'Orders pdf report get successfully' });

        } else if (reportType === 'EXCEL') {

            const reportInfo = {
                reportName: 'Orders',
                arrayData: orderDetail,
                fileName: 'ordersExcel.xlsx',
                columns: [
                    { header: 'Products', key: 'products', width: 20 },
                    { header: 'Status', key: 'status', width: 20 },
                    { header: 'Order Status', key: 'orderStatus', width: 20 },
                    { header: 'Payment Method', key: 'payment_method', width: 35 },
                    { header: 'Payment Status', key: 'payment_status', width: 20 },
                    { header: 'Amount', key: 'amount', width: 20 },
                    { header: 'Created', key: 'create', width: 20 }
                ]
            }

            const Report = await getExcelReport(reportInfo);

            if (Report.status) {
                const downloadUrl = (req.protocol + '://' + req.get('host') + '/' + reportInfo.fileName);
                return res.send({ status: true, data: { fileUrl: downloadUrl }, message: Report.message });
            } else {
                return res.send({ status: false, message: Report.message });
            }

        } else {
            return res.send({ status: false, message: 'Something went wrong when get report' });
        }

    } catch (error) {
        return res.send({ status: false, message: error.message });
    }
}


exports.getProductsAdvanceReport = async (req, res, next) => {
    try {
        const reqBody = req.body;
        const reportType = reqBody.report_type ? (reqBody.report_type).toUpperCase() : '';
        const reportArray = ['PDF', 'EXCEL'];

        if (!reportType || !reportArray.includes(reportType)) {
            return res.send({ status: false, message: 'report_type is incorrect, please define correct report_type' });
        }
        // Pagination
        const currentPage = reqBody.page ? Number(reqBody.page) : 0;
        const Limit = reqBody.limit ? Number(reqBody.limit) : 10;
        const skipRecord = currentPage * Limit;

        // Sorting
        const sortColumn = reqBody.sortColumn ? reqBody.sortColumn : '_id';
        const sortBy = reqBody.sortBy ? reqBody.sortBy : 'desc';

        // Query String
        const queryStr = reqBody.queryStr ? reqBody.queryStr : {};
        const category = reqBody.category;
        const subCategory = reqBody.sub_category;
        const filter = reqBody.filter ? new RegExp(reqBody.filter, 'i') : '';

        const MATCH = {};
        MATCH.$and = [];
        MATCH.$or = [];

        // for Category and Sub Category
        if (category) { MATCH.$and.push({ 'category.name': new RegExp(category, 'i') }) }
        if (subCategory) { MATCH.$and.push({ 'subcategory.name': new RegExp(subCategory, 'i') }) }

        // for Title
        if (queryStr.title) { MATCH.$and.push({ title: new RegExp(queryStr.title, 'i') }) }

        // for Featured Product
        if (queryStr.is_featured === true) { MATCH.$and.push({ is_featured: true }) } else
            if (queryStr.is_featured === false) { MATCH.$and.push({ is_featured: false }) }

        // for Hot Product
        if (queryStr.is_hot === true) { MATCH.$and.push({ is_hot: true }) } else
            if (queryStr.is_hot === false) { MATCH.$and.push({ is_hot: false }) }

        // for Sale Product
        if (queryStr.is_sale === true) { MATCH.$and.push({ is_sale: true }) } else
            if (queryStr.is_sale === false) { MATCH.$and.push({ is_sale: false }) }

        // for Active Product
        if (queryStr.is_active === true) { MATCH.$and.push({ is_active: true }) } else
            if (queryStr.is_active === false) { MATCH.$and.push({ is_active: false }) }

        // for Premium Product
        if (queryStr.is_premium_package === true) { MATCH.$and.push({ is_premium_package: true }) } else
            if (queryStr.is_premium_package === false) { MATCH.$and.push({ is_premium_package: false }) }

        // for Price
        if (isValidArr(queryStr.price, 2)) {
            MATCH.$and.push({ price: { $gte: parseInt(queryStr.price[0]), $lt: (parseInt(queryStr.price[1]) + 1) } });
        }

        // for Vendor
        if (isValidArr(queryStr.vendor)) {
            const Vdr = []
            queryStr.vendor.forEach(E => { if (E) Vdr.push(new RegExp(E, 'i')) });
            if (Vdr.length)
                MATCH.$and.push({ vendor: { $in: Vdr } });
        }

        // for Sale Price
        if (isValidArr(queryStr.sale_price, 2)) {
            MATCH.$and.push({ sale_price: { $gte: parseInt(queryStr.sale_price[0]), $lt: (parseInt(queryStr.sale_price[1]) + 1) } });
        }

        // for Varients
        if (isValidArr(queryStr.variants)) {
            (queryStr.variants).forEach(E => {
                if (isValidArr(E.value)) {
                    MATCH.$and.push({ ['variants.' + E.name]: { $in: E.value } });
                }
            })
        }

        // for all search keyup
        if (filter) {
            MATCH.$or.push({ keywords: filter });
            MATCH.$or.push({ title: filter });
            MATCH.$or.push({ sku: filter });
            MATCH.$or.push({ vendor: filter });
            MATCH.$or.push({ 'category.name': filter });
            MATCH.$or.push({ 'subcategory.name': filter });
        }

        if (req.user && req.user.role === ROLES[1]) {
            MATCH.$and.push({ loginid: mongoose.Types.ObjectId(req.user._id) });
        }

        if (!MATCH.$and.length) delete MATCH.$and;
        if (!MATCH.$or.length) delete MATCH.$or;

        console.log(MATCH)
        const productList = await Product.aggregate([
            { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" } },
            { $lookup: { from: "sub_categories", localField: "subCategory", foreignField: "_id", as: "subcategory" } },
            // { $lookup: { from: "userlogins", localField: "loginid", foreignField: "_id", as: "loginid" } },
            { $lookup: { from: "review_seller_products", localField: "_id", foreignField: "product_id", as: "reviews" } },
            // { $unwind: { path: '$loginid', preserveNullAndEmptyArrays: true } },

            { $sort: { [sortColumn]: (sortBy === 'asc' ? 1 : -1) } },
            { $skip: skipRecord },
            { $limit: Limit },
            {
                $project: {
                    title: 1,
                    price: 1,
                    sale_price: 1,
                    vendor: 1,
                    stock_status: 1,
                    sku: 1,
                    reviewcount: 1,
                    loginid: 1,
                    _id: 0
                }
            },
            { $match: MATCH }
        ]);
        // const proCount = await Product.count(MATCH);
        const DataS = [];
        for (let i = 0; i < productList.length; i++) {
            DataS.push({
                sku: (productList[i].sku || ''),
                title: (productList[i].title || ''),
                price: (productList[i].price || 0),
                sale_price: (productList[i].sale_price || 0),
                vendor: (productList[i].vendor || ''),
                stock_status: productList[i].stock_statusx,
                reviewcount: (productList[i].reviewcount || null)
            });
        }
        // return res.send({ status: true, products: productList,  count: proCount })
        if (reportType === 'PDF') {
            const usersHtml = path.resolve(__dirname, '../public/productsHtml.html');
            const usersPdf = path.resolve(__dirname, '../public/productsPdf.pdf');
            const columns =
                `<th>SKU</th>
            <th>Product Name</th>
            <th>Price</th>
            <th>Sale Price</th>
            <th>Vandors</th>
            <th>Stock Status</th>
            <th>Review Count</th>`;
            const tableName = "Product List";
            getPdfdata(DataS, usersHtml, usersPdf, columns, tableName);
            const downloadUrl = (req.protocol + '://' + req.get('host') + '/productsPdf.pdf');

            return res.send({ status: true, data: { fileUrl: downloadUrl }, message: 'Products Pdf report get successfully' });

        } else if (reportType === 'EXCEL') {

            const reportInfo = {
                reportName: 'Product List',
                arrayData: DataS,
                fileName: 'ProductExcel.xlsx',
                columns: [
                    { header: 'SKU', key: 'sku', width: 20 },
                    { header: 'Product Name', key: 'title', width: 20 },
                    { header: 'Price', key: 'price', width: 20 },
                    { header: 'Sale Price', key: 'sale_price', width: 35 },
                    { header: 'Vandors', key: 'vendor', width: 20 },
                    { header: 'Stock Status', key: 'stock_status', width: 20 },
                    { header: 'Review Count', key: 'reviewcount', width: 20 }
                ]
            }

            const Report = await getExcelReport(reportInfo);

            if (Report.status) {
                const downloadUrl = (req.protocol + '://' + req.get('host') + '/' + reportInfo.fileName);
                return res.send({ status: true, data: { fileUrl: downloadUrl }, message: Report.message });
            } else {
                return res.send({ status: false, message: Report.message });
            }

        } else {
            return res.send({ status: false, message: 'Something went wrong when get report' });
        }

    } catch (err) {
        return res.send({ status: false, message: (err.message || "Something went wrong") });
    }
}


exports.getPdfvendorsSubscriptionlist = async (req, res, next) => {
    try {
        const reqBody = req.body;
        const Limit = parseInt(reqBody.limit) || 10;
        const PageNo = parseInt(reqBody.pageno) || 0;

        const sellers = await UserLogins.aggregate([
            { $lookup: { from: 'profiles', localField: '_id', foreignField: "loginid", as: "profileInfo" } },
            { $lookup: { from: 'bussinesses', localField: '_id', foreignField: "loginid", as: "bussinessInfo" } },
            { $unwind: { path: '$profileInfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$bussinessInfo', preserveNullAndEmptyArrays: true } },
            { $match: { roles: ROLES[1], isBussinessVerified: true } },
            { $skip: (PageNo * Limit) },
            { $limit: Limit },
            { $sort: { _id: -1 } },
            {
                $project: {
                    '_id': 0,
                    'email': 1,
                    'roles': 1,
                    'name': "$profileInfo.name",
                    'dob': "$profileInfo.dob",
                    'phone': "$bussinessInfo.phone",
                    'address': "$bussinessInfo.address",
                    'gstno': "$bussinessInfo.gstno",
                    'panNumber': "$bussinessInfo.panNumber",
                    'acNumber': "$bussinessInfo.acNumber",
                    'idno': "$bussinessInfo.idno",
                    'storeName': "$bussinessInfo.storeName",
                }
            },
        ]);
        
        const sellerpdfpathHtml = path.resolve(__dirname, '../public/sellerPDF.html');
        const sellerpdfpathPdf = path.resolve(__dirname, '../public/sellerPDF.pdf');

        const columns =
            `<th>Email</th>
        <th>Role</th>
        <th>Name</th>
        <th>Date Of Birthday</th>
        <th>Phone Number</th>
        <th>Address</th>
        <th>GST Number</th>
        <th>Pan Card Number</th>
        <th>Account Number</th>
        <th>ID Number</th>
        <th>Store Name</th>`;
        const tableName = "vendors Subscription list";
        const sellerArray = [];
        sellers.forEach(E => {
            const json = {
                email: E.email,
                roles: E.roles,
                name: E.name,
                dob: E.dob,
                phone: E.phone,
                address: E.address,
                gstno: E.gstno,
                panNumber: E.panNumber,
                acNumber: E.acNumber,
                idno: E.idno,
                storeName: E.storeName,
            }
            sellerArray.push(json);
        })

        getPdfdata(sellerArray, sellerpdfpathHtml, sellerpdfpathPdf, columns, tableName)
        const downloadUrl = (req.protocol + '://' + req.get('host') + '/sellerPDF.pdf');
        return res.send({ status: true, data: { fileUrl: downloadUrl }, message: 'get vendors Subscription list  successfully' });
    } catch (error) {
        return res.send({ status: false, message: error.message });
    }
}


exports.printOrderUser = async (req, res, next) => {
    try {
        const { order_id } = req.body;
        if (!order_id) {
            res.send({ status: false, message: "Please enter order id" });
            return
        }
        const orderInfo = await Order.findById(order_id)
            .select('_id product refund_productIds status create updated number payment_method payment_status loginid')
            .lean().exec();
        if (!orderInfo) {
            return res.send({ status: false, message: `Order not found for id ${order_id}` });
        }
        const productArray = orderInfo.product ? orderInfo.product : [];
        const products = [];
        let totalAmount = 0;
        let totalDiscountedAmount = 0;
        for (let j = 0; j < productArray.length; j++) {
            const jsonOne = { _id: mongoose.Types.ObjectId(productArray[j].id) };
            const Quantity = (productArray[j].quantity || 1);
            const Pdt = await Product.findOne(jsonOne)
                .select('_id title price discount discounted_price');

            if (Pdt) {
                products.push({ product: Pdt, variants: productArray[j].variants });
            }
            if (Pdt && Pdt.price) {
                totalAmount = (totalAmount + Pdt.price) * Quantity;
            }

            if (Pdt && Pdt.discounted_price) {
                totalDiscountedAmount = (totalDiscountedAmount + Pdt.discounted_price) * Quantity;
            }
        }
        orderInfo.product = products[0];
        orderInfo.totalAmount = totalAmount;
        orderInfo.totalDiscountedAmount = totalDiscountedAmount;
        orderInfo.payment_status = orderInfo.payment_status ? 'Paid' : 'Unpaid';
        if (orderInfo.status == 0) {
            orderInfo.orderStatus = 'Placed';
        } else if (orderInfo.status == 1) {
            orderInfo.orderStatus = 'Delivered';
        } else if (orderInfo.status == 2) {
            orderInfo.orderStatus = 'Cancelled';
        } else if (orderInfo.status == 3) {
            orderInfo.orderStatus = 'Returned';
        } else if (orderInfo.status == 4) {
            orderInfo.orderStatus = 'Refund';
        }
        const userInfo = await UserLogins.findOne({ _id: orderInfo.loginid })
            .select('email username user_status')
            .lean().exec();
        const profileInfo = await Profile.findOne({ loginid: orderInfo.loginid }).lean().exec();
        const userAddress = await Address.findOne({ loginid: orderInfo.loginid })
            .select('add1 add2 state country postal')
            .lean().exec();
        userInfo.name = profileInfo ? profileInfo.name : '';
        userInfo.gender = profileInfo ? profileInfo.gender : '';
        userInfo.photo = profileInfo ? profileInfo.photo : '';
        userInfo.dob = profileInfo ? profileInfo.dob : '';
        userInfo.phone = profileInfo ? profileInfo.phone : '';
        orderInfo.userInfo = userInfo;
        orderInfo.address = userAddress;
        const odersArray = [];
        const json = {
            number: orderInfo.number,
            products_name: orderInfo.product ? orderInfo.product.title : '',
            create: orderInfo.create,
            payment_method: orderInfo.payment_method,
            payment_status: orderInfo.payment_status,
            totalAmount: orderInfo.totalAmount,
            // totalDiscountedAmount: orderInfo.totalDiscountedAmount,
            orderStatus: orderInfo.orderStatus,
            // email: orderInfo.userInfo.email,
            name: orderInfo.userInfo.name,
            phone: orderInfo.userInfo.phone,
            // add2:orderInfo.address.add2,
            // country: orderInfo.address.country,
            // state: orderInfo.address.state,
            // postal: orderInfo.address.postal,
        }
        odersArray.push(json);
        const usersHtml = path.resolve(__dirname, '../public/orderuserdetailHtml.html');
        const usersPdf = path.resolve(__dirname, '../public/orderuserdetailPdf.pdf');
        const columns =
            `<th>Number</th>
            <th>Products</th>
        <th>Created</th>
        <th>Payment Method</th>
        <th>Payment Status</th>
        <th>Total Amount</th>
        <th>Status</th>
        <th>USer Name</th>
        <th>User Phone No.</th>
       `;
        const tableName = "Order User Detail";
        getPdfdata(odersArray, usersHtml, usersPdf, columns, tableName);
        const downloadUrl = (req.protocol + '://' + req.get('host') + '/orderuserdetailPdf.pdf');
        return res.send({ status: true, data: { fileUrl: downloadUrl }, message: 'Order User Detail Pdf report get successfully' });

    } catch (e) {
        console.log(e)
        res.send({ status: false, message: e.message });
    }
}



function generateInvoiceHeader(doc, data) {
    doc
        .fillColor("#444444")
        .fontSize(20)
        .text("GALI NUKKAD Inc.", 50, 57)
        .fontSize(10)
        .text("GALI NUKKAD.", 200, 50, { align: "right" })
        .text("123 shai ram plaza", 200, 65, { align: "right" })
        .text("Indore, India, 10025", 200, 80, { align: "right" })
        .moveDown();
}

function generateInvoiceCustomerInformation(doc, invoice) {
    doc
        .fillColor("#444444")
        .fontSize(20)
        .text("Invoice", 50, 160);
    generateInvoiceHrShow(doc, 185);
    const customerInformationTop = 200;
    for (i = 0; i < invoice.length; i++) {
        doc
            .fontSize(10)
            .text("Invoice Number:", 50, customerInformationTop)
            .font("Helvetica-Bold")
            .text(invoice[i]._id, 150, customerInformationTop)
            .font("Helvetica")
            .text("Invoice Date:", 50, customerInformationTop + 15)
            .text(formatDate(new Date()), 150, customerInformationTop + 15)
            .text("Balance Due:", 50, customerInformationTop + 30)
            .text(invoice[i].amount, 150, customerInformationTop + 30)

            .font("Helvetica-Bold")
            .text(invoice[i].userInfo.name, 300, customerInformationTop)
            .font("Helvetica")
            .text(invoice[i].address.add1 + ", " + invoice[i].address.add2, 300, customerInformationTop + 15)
            .text(invoice[i].address.state + ", " + invoice[i].address.country + ", " + invoice[i].address.postal, 300, customerInformationTop + 30)
            .moveDown();
    }
    generateInvoiceHrShow(doc, 252);
}

function generateInvoiceTableShow(doc, invoice) {
    const invoiceTableTop = 330;
    doc.font("Helvetica-Bold");
    generateInvoiceTableRowShow(
        doc,
        invoiceTableTop,
        "Product",
        "Price",
        "Qty",
        "Total",
    );
    generateInvoiceHrShow(doc, invoiceTableTop + 20);
    doc.font("Helvetica");

    for (let i = 0; i < invoice.length; i++) {
        const INV = invoice[i];
        const position = invoiceTableTop + (i + 1) * 30;

        for (let j = 0; j < INV.products.length; j++) {
            const PRO = INV.products[j];

            generateInvoiceTableRowShow(
                doc,
                position,
                PRO.title,
                PRO.sale_price,
                INV.product[j].quantity,
                (PRO.sale_price * INV.product[j].quantity)
            );
            generateInvoiceHrShow(doc, position + 20);
        }
    }

    const subtotalPosition = invoiceTableTop + 300;
    doc.font("Helvetica-Bold");
    generateInvoiceTableRowShow(
        doc,
        subtotalPosition,
        "",
        "Total",
        "",
        invoice[0] ? (invoice[0].amount || 0) : 0
    );
    doc.font("Helvetica");
}

function generateInvoiceTableRowShow(doc, y, Product, SalePrice, Qty, Total) {
    doc
        .fontSize(10)
        .text(Product, 10, y)
        .text(SalePrice, 200, y)
        .text(Qty, 250, y, { width: 50, align: "right" })
        .text(Total, 0, y, { align: "right" });
}

function generateInvoiceHrShow(doc, y) {
    doc
        .strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(10, y)
        .lineTo(600, y)
        .stroke();
}


function isValidArr(array, length = 0) {
    if (length) {
        if (Array.isArray(array) && array.length === length) {
            return true;
        } else {
            return false;
        }
    } else {
        if (Array.isArray(array) && array.length) {
            return true;
        } else {
            return false;
        }
    }
}
