const db = require('../_helper/db');
const Product = db.Product;
const UserLogins = db.UserLogins;
const Profile = db.Profile;
const Bussiness = db.Bussiness;
const Order = db.Order;
const Review = db.Review;
var ROLES = require('../config.json').ROLES;
let mongoose = require('mongoose')
const { Validator } = require('node-input-validator');
const Visitor_Graph = db.Visitor_Graph;
// var ip = require('ip');
const products_rating = db.Product_rating;
const puppeteer = require('puppeteer');
var fs = require('fs');
var path = require('path');
let moment = require('moment');
const excel = require('exceljs');
const CancelPolicy = db.cancel_policy;



exports.adminShowAllUsers = async (req, res, next) => {
    try {
        const reqBody = req.body;
        const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
        const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;
        let filter = new RegExp(req.body.filter, 'i');
        let role = reqBody.role;

        if (role && !ROLES.includes(role)) {
            return res.send({ status: false, message: "Not valid role" });
        }

        const MATCH = {};
        MATCH.$or = [];
        MATCH.$and = [];

        if (role) {
            MATCH.$and.push({ roles: role });
        }

        if (reqBody.user_status) {
            MATCH.$and.push({ user_status: reqBody.user_status });
        }

        if (filter) {
            MATCH.$or.push({ email: filter });
            MATCH.$or.push({ roles: filter });
            MATCH.$or.push({ name: filter });
        }

        if (!MATCH.$or.length) { delete MATCH.$or; }
        if (!MATCH.$and.length) { delete MATCH.$and; }

        const data = await UserLogins.aggregate([
            { $lookup: { from: 'profiles', localField: '_id', foreignField: "loginid", as: "profileInfo" } },
            { $unwind: { path: '$profileInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    roles: 1,
                    id: 1,
                    email: 1,
                    gstin: 1,
                    fssai: 1,
                    mobile_number: 1,
                    isEmailVerified: 1,
                    isBussinessVerified: 1,
                    username: 1,
                    note: 1,
                    'name': "$profileInfo.name",
                    'photo': "$profileInfo.photo",
                    'create': "$profileInfo.create",
                    'user_status': {
                        $cond: {
                            if: { $eq: ["$user_status", "deactive"] },
                            then: "deactive",
                            else: "active"
                        }
                    },
                }
            },
            { $match: MATCH },
            { $skip: (Limit * PageNo) },
            { $limit: Limit },
        ]);

        const countUser = await UserLogins.aggregate([
            { $lookup: { from: 'profiles', localField: '_id', foreignField: "loginid", as: "profileInfo" } },
            { $unwind: { path: '$profileInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    roles: 1,
                    id: 1,
                    email: 1,
                    gstin: 1,
                    fssai: 1,
                    mobile_number: 1,
                    isEmailVerified: 1,
                    isBussinessVerified: 1,
                    username: 1,
                    'name': "$profileInfo.name",
                    'photo': "$profileInfo.photo",
                    'create': "$profileInfo.create",
                    'user_status': {
                        $cond: {
                            if: { $eq: ["$user_status", "deactive"] },
                            then: "deactive",
                            else: "active"
                        }
                    },
                }
            },
            { $match: MATCH },
        ]);


        return res.send({ status: true, data: data, count: countUser.length, message: 'users get successfully' });
    } catch (error) {
        return res.send({ status: false, message: error.message });
    }
}
exports.adminUpdateUserStatus = async (req, res, next) => {

    try {

        let v = new Validator(req.body, { //validator 
            userID: 'required',
            user_status: 'required',
        })
        console.log(req.body.userID);
        console.log(req.body.user_status);
        let check = await v.check();
        if (!check) {
            res.status(422).json({
                statusCode: 422,
                message: 'Please enter all required field',
            });
        } else {
            let checkuser = UserLogins.findOne({ _id: req.body.userID })
            if (!checkuser) {
                console.log(checkuser);
                res.send({ status: false, message: "user not found" });
                return
            }

            UserLogins.updateOne({ _id: req.body.userID }, { $set: { user_status: req.body.user_status } }).then(data => {
                res.send({ status: true, result: data, message: "record updated!" });
            }).catch(err => {
                res.send({ status: false, message: "Something went wrong!" });
            })
        }

    } catch (e) {
        res.send({ status: false, message: "Something went wrong!" });
    }
}

// exports.getvendorsSubscriptionlist = async (req, res, next) => {
//     try {
//         const reqBody = req.body;
//         const Limit = parseInt(reqBody.limit) || 10;
//         const PageNo = parseInt(reqBody.pageno) || 0;

//         const sellers = await UserLogins.aggregate([
//             { $lookup: { from: 'profiles', localField: '_id', foreignField: "loginid", as: "profileInfo" } },
//             { $lookup: { from: 'bussinesses', localField: '_id', foreignField: "loginid", as: "bussinessInfo" } },
//             { $unwind: { path: '$profileInfo', preserveNullAndEmptyArrays: true } },
//             { $match: { roles: ROLES[1], isBussinessVerified: true } },
//             { $skip: (PageNo * Limit) },
//             { $limit: Limit },
//             {
//                 $project: {
//                     'password': 0,
//                     'bussinessInfo.loginid': 0,
//                     'profileInfo.loginid': 0
//                 }
//             },
//         ]);

//         const countSellers = await UserLogins.aggregate([
//             { $lookup: { from: 'profiles', localField: '_id', foreignField: "loginid", as: "profileInfo" } },
//             { $lookup: { from: 'bussinesses', localField: '_id', foreignField: "loginid", as: "bussinessInfo" } },
//             { $unwind: { path: '$profileInfo', preserveNullAndEmptyArrays: true } },
//             { $match: { roles: ROLES[1], isBussinessVerified: true } },
//             {
//                 $project: {
//                     'password': 0,
//                     'bussinessInfo.loginid': 0,
//                     'profileInfo.loginid': 0
//                 }
//             },
//         ]);

//         return res.send({ status: true, data: sellers, count: countSellers.length, message: 'get vendors Subscription list successfully' });
//     } catch (error) {
//         return res.send({ status: false, message: error.message });
//     }
// }


exports.createvisitorgraph = async (req, res, next) => {
    try {
        // var ip_address = ip.address();

        const visitorJson = {
            product_id: req.body.product_id,
            seller_id: req.body.seller_id,
            visitor_ip_address: req.body.ip_address,
        };

        Visitor_Graph.create(visitorJson).then(user => {
            res.send({ status: true, message: "Add Visitor", result: user._id });
        }).catch(err => {
            res.send({ status: false, message: err.message });
        })
    } catch {
        res.send({ status: false, message: "Something went wrong!" });
    }
}

exports.createProductRating = async (req, res, next) => {
    try {
        const { userId, product_id, message, rating } = req.body;
        if (!product_id || !message) {
            return res.send({ status: false, message: 'required parameter missing' });
        }
        const isRating = await products_rating.findOne({ loginid: userId, product_id: product_id });
        if (isRating) {
            await products_rating.findByIdAndUpdate(isRating._id, { message: message, rating: rating });
            return res.send({ status: true, message: 'Rating updated successfully' });
        } else {
            const json = {
                loginid: userId,
                product_id: product_id,
                message: message,
                rating: rating,
            };
            const created = await (new products_rating(json)).save();
            return res.send({ status: true, data: created._id, message: 'Rating created successfully' });
        }
    } catch (e) {
        return res.send({ status: false, message: e.message })
    }
}

exports.getProductRating = async (req, res, next) => {
    try {
        const reqBody = req.body;
        if (!reqBody.product_id) {
            return res.send({ status: false, message: "Product id is required" });
        }
        let limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
        let pageno = reqBody.page ? parseInt(reqBody.page) : 0;
        let countRatings = await products_rating.countDocuments({ product_id: mongoose.Types.ObjectId(reqBody.product_id) });
        const ratingList = await products_rating.aggregate([
            { $lookup: { from: "products", localField: "product_id", foreignField: "_id", as: "productInfo" } },
            { $lookup: { from: "userlogins", localField: "loginid", foreignField: "_id", as: "userInfo" } },
            { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    "userInfo.password": 0
                },
            },
            { $match: { product_id: mongoose.Types.ObjectId(reqBody.product_id) } },
            { $skip: (limit * pageno) },
            { $limit: limit },
        ]);
        return res.send({ status: true, data: ratingList, count: countRatings });
    } catch (e) {
        return res.send({ status: false, message: e.message })
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
        getPdfdata(sellers, sellerpdfpathHtml, sellerpdfpathPdf, columns, tableName)
        const downloadUrl = (req.protocol + '://' + req.get('host') + '/sellerPDF.pdf');

        return res.send({ status: true, data: { fileUrl: downloadUrl }, message: 'get vendors Subscription list  successfully' });
    } catch (error) {
        return res.send({ status: false, message: error.message });
    }
}

exports.userCount = async (req, res, next) => {
    try {
        const reqBody = req.body;
        var condition = {};
        var feed_condition = {};
        if (reqBody.product_id) {
            condition = { product_id: mongoose.Types.ObjectId(reqBody.product_id) };
        }

        if (reqBody.seller_id) {
            feed_condition = { seller_id: mongoose.Types.ObjectId(reqBody.seller_id) };
        }
        let countactiveUsers = await UserLogins.countDocuments({ user_status: 'active' });
        let countvisitorUsers = await Visitor_Graph.aggregate([
            { $match: condition },
            {
                $group: {
                    _id: "$visitor_ip_address", count: { $sum: 1 }
                }
            },
        ]);
        let feedback = await Review.countDocuments(feed_condition);
        return res.send({ status: true, data: { User_Count: countactiveUsers, visitor_Count: countvisitorUsers.length, feedback_count: feedback } });
    } catch (e) {
        res.send({ status: false, message: e.message })
    }
}


exports.salesCount = async (req, res, next) => {
    try {

        const reqBody = req.body;
        const StartDate = reqBody.start_date;

        var condition = {};
        var seller_id = req.body.seller_id;
        if (seller_id) {
            condition = { seller_id: mongoose.Types.ObjectId(seller_id) };

        }
        var toDay = moment(new Date()).format("YYYY-MM-DD");
        let countactiveUsers = await Order.find(condition);
        var resultOrderData = countactiveUsers.filter(function (order) {
            var date = moment(new Date(order.create)).format("YYYY-MM-DD");
            return (date == toDay && order.status == '0');
        });
        var returnOrderData = countactiveUsers.filter(function (returnOrder) {
            var date = moment(new Date(returnOrder.create)).format("YYYY-MM-DD");
            return (date == toDay && returnOrder.status == '3');
        });
        const allOrderSeal = await getSealCountData(condition, { status: 0 }, StartDate);
        const returnAllOrderData = await getSealCountData(condition, { status: 3 }, StartDate);
        const toDaySale = resultOrderData.length;
        const toDayReturn = returnOrderData.length;

        return res.send({
            status: true,
            countData: { toDaySale_Count: toDaySale, toDayReturnOrder_Count: toDayReturn },
            allOrderSaleData: allOrderSeal[0] ? allOrderSeal[0].data : {},
            returnOrderData: returnAllOrderData[0] ? returnAllOrderData[0].data : {}
        });
    } catch (e) {
        res.send({ status: false, message: e.message })
    }
}

exports.createCancelPolicy = async (req, res, next) => {
    try {
        let v = new Validator(req.body, { //validator
            days: 'required',
        })
        let check = await v.check();
        if (!check) {
            res.status(422).json({
                statusCode: 422,
                message: 'Please enter all required field',
            });
        } else {
            let data = {
                days: req.body.days
            }
            CancelPolicy.create(data).then(user => {
                res.send({ status: true, message: "Cancel Policy created!", result: user });
            }).catch(err => {
                console.log(err)
                res.send({ status: false, message: (err.message || "Something went wrong!") });
            })
        }
    } catch (e) {
        console.log(e)
        res.send({ status: false, message: "Something went wrong!" });
    }
}
exports.UpdateCancelPolicy = async (req, res, next) => {
    try {
        let v = new Validator(req.body, { //validator
            IDs: 'required',
            days: 'required',
        })
        let check = await v.check();
        if (!check) {
            res.status(422).json({
                statusCode: 422,
                message: 'Please enter all required field',
            });
        } else {
            let checkPolicy = CancelPolicy.findOne({ _id: req.body.IDs })
            if (!checkPolicy) {
                res.send({ status: false, message: "Policy not found" });
                return
            }

            CancelPolicy.updateOne({ _id: req.body.IDs }, { $set: { days: req.body.days } }).then(data => {
                res.send({ status: true, result: data, message: "record updated!" });
            }).catch(err => {
                res.send({ status: false, message: "Something went wrong!" });
            })
        }

    } catch (e) {
        res.send({ status: false, message: "Something went wrong!" });
    }
}
exports.listCancelPolicy = async (req, res, next) => {

    try {
        const reqBody = req.body;
        const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
        const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;
        const count = await CancelPolicy.count();

        CancelPolicy.find().sort({ update_date: -1 }).skip(Limit * PageNo).limit(Limit).then(user => {

            res.send({ status: true, message: "Record fetched", result: user, count: count });
        }).catch(err => {
            console.log(err);
            res.send({ status: false, message: err.message });
        })
    } catch (e) {
        res.send({ status: false, message: e.message });
    }
}

exports.listCancelPolicyById = async (req, res, next) => {
    try {
        let v = new Validator(req.query, { //validator

            Ids: 'required'
        });
        let check = await v.check();

        if (!check) {
            res.status(422).json({
                statusCode: 422,
                message: 'Please enter User Id',
            });
        } else {
            CancelPolicy.findOne({ _id: req.query.Ids }).then(user => {

                res.send({ status: true, message: "Record fetched", result: user });
            }).catch(err => {
                console.log(err);
                res.send({ status: false, message: "Something went wrong!" });
            })
        }
    } catch (e) {
        res.send({ status: false, message: "Something went wrong!" });
    }
}

exports.dashBoard = async (req, res, next) => {
    try {
        const reqBody = req.body;
        const StartDate = reqBody.start_date;
        var condition = {};
        var visitor_graph_cond = {};
        var toDay = moment(new Date()).format("YYYY-MM-DD");
        if (reqBody.product_id) {
            visitor_graph_cond = { product_id: mongoose.Types.ObjectId(reqBody.product_id) };
        }
        // if (req.user && req.user.role == ROLES[1]) {
        //     condition = { seller_id: mongoose.Types.ObjectId(req.user._id) };
        // }
        const loginid = req.user._id;

        const isSeller = req.user.role === ROLES[1] ? true : false;
        console.log(loginid)
        const data = await UserLogins.aggregate([
            { $lookup: { from: 'profiles', localField: '_id', foreignField: "loginid", as: "profileInfo" } },
            { $unwind: { path: '$profileInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    roles: 1,
                    _id: 1,
                    id: 1,
                    email: 1,
                    mobile_number: 1,
                    username: 1,
                    'name': "$profileInfo.name",
                    'photo': "$profileInfo.photo",
                    'create': "$profileInfo.create",
                    'phone': "$profileInfo.phone"
                }
            },
            { $match: { _id: mongoose.Types.ObjectId(loginid) } },
        ]);

        let countactiveUsers = await UserLogins.countDocuments({ user_status: 'active' });
        let total_Users = await UserLogins.countDocuments();
        let total_Seller = await UserLogins.countDocuments({ roles: ROLES[1] });
        let countvisitorUsers = await Visitor_Graph.aggregate([
            { $match: visitor_graph_cond },
            { $group: { _id: "$visitor_ip_address", count: { $sum: 1 } } }
        ]);
        let Total_Products = await Product.countDocuments(isSeller ? { loginid: loginid } : {});
        // let sellerFeedback = await Review.countDocuments(isSeller ? { seller_id: loginid } : { $or: [{ seller_id: { $ne: null } }, { seller_id: { $ne: "" } }] });

        const allSellerReview = await Review.find().lean().exec();

        let sellerFeedback = 0;

        if (isSeller)
            sellerFeedback = allSellerReview.filter(x => x.seller_id == loginid).length;
        else
            sellerFeedback = allSellerReview.filter(x => x.seller_id).length;


        // let feedback = await Review.countDocuments();
        let countOrder = await Order.find();


        if (isSeller) {
            countOrder = await getDynamicSellerOrder(loginid, 0, 0, {}, {});
        }

        var resultOrderData = countOrder.filter(function (order) {
            var date = moment(new Date(order.create)).format("YYYY-MM-DD");
            return (date == toDay);
        });
        var returnOrderData = countOrder.filter(function (returnOrder) {
            var date = moment(new Date(returnOrder.create)).format("YYYY-MM-DD");
            return (date == toDay && returnOrder.status == '3');
        });
        var cancel_Orders = countOrder.filter(function (returnOrder) {
            return (returnOrder.status == '2');
        });
        var total_Refund_Orders = countOrder.filter(function (returnOrder) {
            return (returnOrder.status == '3');
        });

        const allOrderSeal = {};
        const returnAllOrderData = {};
        const YEAR_BEFORE = StartDate ? moment(new Date(StartDate)).format('MM-DD-YYYY') : moment().subtract(1, 'year').format('MM-DD-YYYY');
        const monthsArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

        let beforDate = YEAR_BEFORE;

        var currentdate = moment(new Date()).format('MM-DD-YYYY');
        const afterD = new Date(currentdate).getMonth() + '-' + new Date(currentdate).getFullYear();

        if (isSeller) {
            for (let i = 0; i < 20; i++) {
                beforDate = moment(new Date(beforDate)).add(1, 'M').format('MM-DD-YYYY');

                const beforeMonth = new Date(beforDate).getMonth();
                const beforeYear = new Date(beforDate).getFullYear();

                const beforD = beforeMonth + '-' + beforeYear;

                const allOrder = await getDynamicSellerOrder
                    (loginid, 0, 0, {}, { month: beforeMonth, year: beforeYear });

                const allReturnOrder = await getDynamicSellerOrder
                    (loginid, 0, 0, { status: 3 }, { month: beforeMonth, year: beforeYear });

                allOrderSeal[monthsArray[beforeMonth] + '-' + beforeYear] = allOrder.length;
                returnAllOrderData[monthsArray[beforeMonth] + '-' + beforeYear] = allReturnOrder.length;

                if (beforD === afterD) {
                    break;
                }
            }
        } else {

            for (let i = 0; i < 20; i++) {
                beforDate = moment(new Date(beforDate)).add(1, 'M').format('MM-DD-YYYY');

                const beforeMonth = new Date(beforDate).getMonth();
                const beforeYear = new Date(beforDate).getFullYear();

                const beforD = beforeMonth + '-' + beforeYear;

                const PROJECT = {
                    status: 1,
                    // create: 1,
                    month: { $month: "$create" },
                    year: { $year: "$create" }
                };

                const jsonStr1 = {
                    month: (beforeMonth + 1),
                    year: beforeYear
                }
                const jsonStr2 = {
                    month: (beforeMonth + 1),
                    year: beforeYear,
                    status: 3
                }

                const orderDetail1 = await Order.aggregate([
                    { $project: PROJECT },
                    { $match: jsonStr1 },
                ]);
                const orderDetail2 = await Order.aggregate([
                    { $project: PROJECT },
                    { $match: jsonStr2 },
                ]);

                allOrderSeal[monthsArray[beforeMonth] + '-' + beforeYear] = orderDetail1.length;
                returnAllOrderData[monthsArray[beforeMonth] + '-' + beforeYear] = orderDetail2.length;

                if (beforD === afterD) {
                    break;
                }
            }



        }

        // console.log(d)


        const toDaySale = resultOrderData.length;
        const toDayReturn = returnOrderData.length;

        const DBdata = {
            GetTotalProducts: Total_Products,
            get_Total_Orders: countOrder.length,
            get_Cancel_Orders: cancel_Orders.length,
            get_Total_Refund_Orders: total_Refund_Orders.length,
            get_ToDay_Sale: toDaySale,
            get_ToDay_Return_Order: toDayReturn,
            get_Total_Seller: isSeller ? undefined : total_Seller,
            get_Total_Users: isSeller ? undefined : total_Users,
            get_Total_Active_Users: isSeller ? undefined : countactiveUsers,
            get_Total_Visitor: countvisitorUsers.length,
            get_seller_Feedback: sellerFeedback,
            get_UserInfo: data.length ? data[0] : {}
        };
        return res.send({
            status: true,
            countData: DBdata,
            allOrderSaleData: allOrderSeal,
            returnOrderData: returnAllOrderData
        });
    } catch (e) {
        res.send({ status: false, message: e.message })
    }
}

function getSealCountData(condition, fields = {}, StartYear) {
    const FIRST_MONTH = 1;
    const LAST_MONTH = 12;
    const TODAY = moment(new Date()).format("YYYY-MM-DD");
    const YEAR_BEFORE = StartYear ? moment(new Date(StartYear)).format('YYYY-MM-DD') : moment().subtract(1, 'year').format('YYYY-MM-DD');

    const monthsArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    fields.create = { '$gte': new Date(YEAR_BEFORE), '$lt': new Date(TODAY) };
    const MATCH = {};
    MATCH.$and = [];
    MATCH.$or = [];
    Object.keys(fields).forEach(E => {
        if (fields[E] !== '') {
            MATCH.$and.push({ [E]: fields[E] })
        }
    });

    if (condition.seller_id) { MATCH.$and.push(condition); }

    if (!MATCH.$and.length) delete MATCH.$and;
    if (!MATCH.$or.length) delete MATCH.$or;

    console.log(MATCH)

    return new Promise(async (resolve, reject) => {
        try {

            const list = await Order.aggregate([
                { $match: MATCH },

                {
                    $group: {
                        _id: { "year_month": { $substrCP: ["$create", 0, 7] } },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { "_id.year_month": 1 }
                },
                {
                    $project: {
                        _id: 0,
                        count: 1,
                        month_year: {
                            $concat: [
                                { $arrayElemAt: [monthsArray, { $subtract: [{ $toInt: { $substrCP: ["$_id.year_month", 5, 2] } }, 1] }] },
                                "-",
                                { $substrCP: ["$_id.year_month", 0, 4] }
                            ]
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        data: { $push: { k: "$month_year", v: "$count" } }
                    }
                },
                {
                    $addFields: {
                        start_year: { $substrCP: [YEAR_BEFORE, 0, 4] },
                        end_year: { $substrCP: [TODAY, 0, 4] },
                        months1: { $range: [{ $toInt: { $substrCP: [YEAR_BEFORE, 5, 2] } }, { $add: [LAST_MONTH, 1] }] },
                        months2: { $range: [FIRST_MONTH, { $add: [{ $toInt: { $substrCP: [TODAY, 5, 2] } }, 1] }] }
                    }
                },
                {
                    $addFields: {
                        template_data: {
                            $concatArrays: [
                                {
                                    $map: {
                                        input: "$months1", as: "m1",
                                        in: {
                                            count: 0,
                                            month_year: {
                                                $concat: [{ $arrayElemAt: [monthsArray, { $subtract: ["$$m1", 1] }] }, "-", "$start_year"]
                                            }
                                        }
                                    }
                                },
                                {
                                    $map: {
                                        input: "$months2", as: "m2",
                                        in: {
                                            count: 0,
                                            month_year: {
                                                $concat: [{ $arrayElemAt: [monthsArray, { $subtract: ["$$m2", 1] }] }, "-", "$end_year"]
                                            }
                                        }
                                    }
                                }]
                        }
                    }
                },
                {
                    $addFields: {
                        data: {
                            $map: {
                                input: "$template_data", as: "t",
                                in: {
                                    k: "$$t.month_year",
                                    v: {
                                        $reduce: {
                                            input: "$data", initialValue: 0,
                                            in: {
                                                $cond: [{ $eq: ["$$t.month_year", "$$this.k"] },
                                                { $add: ["$$this.v", "$$value"] },
                                                { $add: [0, "$$value"] }
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        data: { $arrayToObject: "$data" },
                        _id: 0
                    }
                }
            ]);
            resolve(list);
        } catch (error) {
            console.log(error.message)
            resolve([])
        }
    })
}


function getDynamicSellerOrder(sellerId, limit, skipRecord, match, otherMatch) {
    try {

        const seller_id = sellerId;
        const Limit = limit;
        const SkipRecord = skipRecord;

        return new Promise(async (resolve, reject) => {
            try {
                let allOrders = await Order.find(match)
                    .select('_id product refund_productIds return_productIds status create updated number payment_method payment_status track_status delivered_date expected_delivered_date')
                    .lean().exec();

                for (let i = 0; i < allOrders.length; i++) {
                    const V1 = allOrders[i];
                    const productArray = [];
                    const refundedArray = [];
                    const returnedArray = [];
                    let totalAmount = 0;
                    let totalDiscountedAmount = 0;
                    if (V1.product) {
                        for (let j = 0; j < V1.product.length; j++) {

                            if (!(V1.product[j].quantity)) {
                                continue;
                            }

                            const sellerProduct = await Product.findOne({ _id: mongoose.Types.ObjectId(V1.product[j].id), loginid: seller_id })
                                // .select('_id title price discounted_price')
                                .lean().exec();
                            const Quantity = (V1.product[j].quantity || 1);

                            if (sellerProduct) {

                                if (sellerProduct.images) {
                                    const isArray = Array.isArray(sellerProduct.images);
                                    const isObject = sellerProduct.images.file;

                                    if (isArray) {
                                        let arrayToObject = {};
                                        sellerProduct.images.forEach(E2 => {
                                            if (E2.file) {
                                                arrayToObject = { file: E2.file };
                                            } else {
                                                arrayToObject = { file: E2 };
                                            }
                                        })
                                        sellerProduct.images = arrayToObject;
                                    }

                                    if (isObject) {
                                        sellerProduct.images.file = sellerProduct.images.file;
                                    }

                                    if (!isArray && !isObject) {
                                        sellerProduct.images = { file: sellerProduct.images };
                                    }

                                    sellerProduct.thumbnailImage = (sellerProduct.images && sellerProduct.images.file) ? 'thumbnail/' + sellerProduct.images.file : '';

                                } else {
                                    sellerProduct.images = {};
                                }

                                // for slider image
                                if (sellerProduct.gallary_images) {
                                    sellerProduct.gallary_thumbnailImages = [];
                                    sellerProduct.gallary_images.forEach(E2 => {
                                        E2.file = E2.file;
                                        sellerProduct.gallary_thumbnailImages.push('thumbnail/' + E2.file);
                                    });
                                } else {
                                    sellerProduct.gallary_images = [];
                                }

                                const proReviews = await Review.find({ product_id: sellerProduct._id })
                                    .select('message rating loginid')
                                    .lean().exec();

                                for (let m = 0; m < proReviews.length; m++) {
                                    const userInfo = await UserLogins.findById(proReviews[m].loginid)
                                        .select('email username')
                                        .lean().exec();
                                    proReviews[m].userInfo = userInfo;
                                }

                                sellerProduct.reviews = proReviews;

                                productArray.push({ product: sellerProduct, quantity: Quantity, variants: V1.product[j].variants });
                            }

                            if (sellerProduct && sellerProduct.price) {
                                totalAmount = (totalAmount + sellerProduct.price) * Quantity;
                            }

                            if (sellerProduct && sellerProduct.discounted_price) {
                                totalDiscountedAmount = (totalDiscountedAmount + sellerProduct.discounted_price) * Quantity;
                            }
                        }
                    }

                    if (V1.refund_productIds) {
                        for (let j = 0; j < V1.refund_productIds.length; j++) {

                            if (!(V1.refund_productIds[j])) {
                                continue;
                            }

                            const sellerProduct = await Product.findOne({ _id: mongoose.Types.ObjectId(V1.refund_productIds[j]), loginid: seller_id })
                                // .select('_id title price discounted_price');
                                .lean().exec();
                            if (sellerProduct) {

                                if (sellerProduct.images) {
                                    const isArray = Array.isArray(sellerProduct.images);
                                    const isObject = sellerProduct.images.file;

                                    if (isArray) {
                                        let arrayToObject = {};
                                        sellerProduct.images.forEach(E2 => {
                                            if (E2.file) {
                                                arrayToObject = { file: E2.file };
                                            } else {
                                                arrayToObject = { file: E2 };
                                            }
                                        })
                                        sellerProduct.images = arrayToObject;
                                    }

                                    if (isObject) {
                                        sellerProduct.images.file = sellerProduct.images.file;
                                    }

                                    if (!isArray && !isObject) {
                                        sellerProduct.images = { file: sellerProduct.images };
                                    }

                                    sellerProduct.thumbnailImage = (sellerProduct.images && sellerProduct.images.file) ? 'thumbnail/' + sellerProduct.images.file : '';

                                } else {
                                    sellerProduct.images = {};
                                }

                                // for slider image
                                if (sellerProduct.gallary_images) {
                                    sellerProduct.gallary_thumbnailImages = [];
                                    sellerProduct.gallary_images.forEach(E2 => {
                                        E2.file = E2.file;
                                        sellerProduct.gallary_thumbnailImages.push('thumbnail/' + E2.file);
                                    });
                                } else {
                                    sellerProduct.gallary_images = [];
                                }


                                refundedArray.push(sellerProduct);
                            }
                        }
                    }

                    if (V1.return_productIds) {
                        for (let j = 0; j < V1.return_productIds.length; j++) {
                            if (V1.return_productIds[j].id) {

                                if (!(V1.return_productIds[j].description)) {
                                    continue;
                                }

                                const sellerProduct = await Product.findOne({ _id: mongoose.Types.ObjectId(V1.return_productIds[j].id), loginid: seller_id })
                                    // .select('_id title')
                                    .lean().exec();
                                if (sellerProduct) {
                                    sellerProduct.price = V1.return_productIds[j].price;
                                    sellerProduct.description = V1.return_productIds[j].description;
                                    returnedArray.push(sellerProduct);
                                }
                            }
                        }
                    }

                    allOrders[i].product = productArray;
                    allOrders[i].refund_productIds = refundedArray;
                    allOrders[i].return_productIds = returnedArray;
                    allOrders[i].totalAmount = totalAmount;
                    allOrders[i].totalDiscountedAmount = totalDiscountedAmount;
                    allOrders[i].payment_status = allOrders[i].payment_status ? 'Paid' : 'Unpaid';
                    allOrders[i].track_status = allOrders[i].track_status ? allOrders[i].track_status : 'Pending';

                    if (allOrders[i].status == 0) {
                        allOrders[i].orderStatus = 'Placed';
                    } else if (allOrders[i].status == 1) {
                        allOrders[i].orderStatus = 'Delivered';
                    } else if (allOrders[i].status == 2) {
                        allOrders[i].orderStatus = 'Cancelled';
                    } else if (allOrders[i].status == 3) {
                        allOrders[i].orderStatus = 'Returned';
                    } else if (allOrders[i].status == 4) {
                        allOrders[i].orderStatus = 'Refund';
                    }
                }

                // month year wise filter
                if (otherMatch.month && otherMatch.year) {
                    allOrders = allOrders.filter(x =>
                        (new Date(x.create).getMonth() + 1) === otherMatch.month
                        &&
                        (new Date(x.create).getFullYear()) === otherMatch.year
                    )
                }

                allOrders = allOrders.filter(x => x.product.length);
                allOrders = allOrders.sort((a, b) => new Date(b.updated) - new Date(a.updated));

                if (Limit) {
                    allOrders = allOrders.slice(SkipRecord);
                    allOrders.length = Limit;
                }

                allOrders = allOrders.filter(x => x);
                return resolve(allOrders)

            } catch (err) {
                return resolve({ message: err.message });
            }
        });
    } catch (error) {
        return resolve({ message: err.message });
    }
}