const db = require('../_helper/db');

const Notification = db.Notification;
const Product = db.Product;
const manage_caselog = db.manage_caselog;
const { Validator } = require('node-input-validator');
const mongoose = require('mongoose');
const Plans = db.Plans;
const sharp = require('sharp');
var path = require('path');
var fs = require('fs');
exports.createManageCaseLog = async (req, res, next) => {
    try {

        let data = {
            loginid: req.user._id,
            message: req.body.message,
            replay: req.body.replay,
        }
        manage_caselog.create(data).then(user => {
            res.send({ status: true, message: "Record inserted!", result: user });
        }).catch(err => {
            console.log(err)
            res.send({ status: false, message: "Something went wrong!" });
        })

    } catch (e) {
        console.log(e)
        res.send({ status: false, message: "Something went wrong!" });
    }
}

exports.listManageCaseLog = async (req, res, next) => {
    try {
        const reqBody = req.body;
        
        const sellerId = reqBody.seller_id ? reqBody.seller_id : "";
        const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
        const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;

        if (!sellerId) {
            return res.send({ status: false, message: "Seller Id is required" });
        }

        let ManageCaselog = await manage_caselog.aggregate([
            { $match: { loginid: mongoose.Types.ObjectId(sellerId) } },
            { $lookup: { from: 'userlogins', localField: 'loginid', foreignField: '_id', as: 'seller' } },
            { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
            { $project: { 'seller.password': 0 } },
            { $sort: { updated: -1 } },
            { $skip: (Limit * PageNo) },
            { $limit: Limit },
        ])
        if (ManageCaselog.length > 0) {
            res.send({ status: true, message: "Record found!", ManageCaselog, count: ManageCaselog.length });
        } else {
            res.send({ status: false, message: "Record not found" });
        }
    } catch (e) {
        console.log(e)
        res.send({ status: false, message: "Something went wrong!" });
    }
}

exports.listAllManageCaseLog = async (req, res, next) => {
    try {
        const reqBody = req.body;
        const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
        const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;
        const status = reqBody.status ? Number(reqBody.status) : "";

        const MATCH = {};
        if (status !== "") {
            MATCH.status = status;
        }

        let ManageCaselog = await manage_caselog.aggregate([
            { $lookup: { from: 'userlogins', localField: 'loginid', foreignField: '_id', as: 'seller' } },
            { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
            { $project: { 'seller.password': 0 } },
            { $match: MATCH },
            { $sort: { updated: -1 } },
            { $skip: (Limit * PageNo) },
            { $limit: Limit },
        ])
        if (ManageCaselog.length > 0) {
            res.send({ status: true, message: "Record found!", ManageCaselog, counts: ManageCaselog.length });
        } else {
            res.send({ status: false, message: "Record not found" });
        }

    } catch (e) {
        console.log(e)
        res.send({ status: false, message: "Something went wrong!" });
    }
}


exports.updateManageCaseLogStatus = async (req, res, next) => {
    try {
        let ManageCaselog = await manage_caselog.findOne({ _id: req.body.caselog_id })
        if (ManageCaselog) {

            manage_caselog.updateOne({ _id: req.body.caselog_id }, { $set: { status: req.body.status } }).then(user => {
                res.send({ status: true, message: "Record updated!" });
            }).catch(err => {
                res.send({ status: false, message: "Something went wrong!" });
            })
        } else {
            res.send({ status: false, message: "Record not found" });
        }
    } catch (e) {
        console.log(e)
        res.send({ status: false, message: "Something went wrong!" });
    }
},
    exports.ManageCaseLogDetail = async (req, res, next) => {
        try {
            let ManageCaselog = await manage_caselog.aggregate([
                { $match: { _id: mongoose.Types.ObjectId(req.body.caselog_id) } },
                { $lookup: { from: 'userlogins', localField: 'loginid', foreignField: '_id', as: 'seller' } }
            ])
            if (ManageCaselog.length > 0) {
                res.send({ status: true, message: "Record found!", result: ManageCaselog[0] });
            } else {
                res.send({ status: false, message: "Record not found" });
            }
        } catch (e) {
            console.log(e)
            res.send({ status: false, message: "Something went wrong!" });
        }
    }

exports.updateManageCaseLog = async (req, res, next) => {
    try {
        let ManageCaselog = await manage_caselog.findOne({ _id: req.body.caselog_id })
        if (ManageCaselog) {
            manage_caselog.updateOne({ _id: req.body.caselog_id }, { $set: req.body }).then(user => {
                res.send({ status: true, message: "Record updated!" });
            }).catch(err => {
                res.send({ status: false, message: "Something went wrong!" });
            })
        } else {
            res.send({ status: false, message: "Record not found" });
        }
    } catch (e) {
        console.log(e)
        res.send({ status: false, message: "Something went wrong!" });
    }
}
exports.deleteManageCaseLog = async (req, res, next) => {
    const { _id } = req.body;

    if (!_id) {
        res.send({ status: false, message: "Required Parameter is missing" });
        return;
    }

    manage_caselog.deleteOne({ _id: _id }).then((data) => {
        res.send({ status: true, data, message: ' deleted successfully' })
    }).catch((err) => {
        res.send({ status: false, message: err.message })
        return;
    });
}

exports.createPlans = async (req, res, next) => {
    try {
        const {
            plan_name,
            products,
            price,

        } = req.body;
        const reqFiles = req.files;

        if (!plan_name || !price) {
            res.send({ status: false, message: "Required Parameter is missing" });
            return;
        }

        const productJson = {
            plan_name: plan_name,
            products: products,
            price: price,
        };

        if (isNaN(price)) {
            res.send({ status: false, message: " Price Should be a number" })
            return;
        }

        if (price < 0) {
            res.send({ status: false, message: " Price Should not be a nagetive number" })
            return;
        }

        const banner = [];
        const vidoes = [];

        reqFiles.forEach(E => {

            var filePath = path.join(__dirname, '../public/thumbnail/');

            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath);
            }

            const fileUrl = filePath + E.filename;

            sharp(E.path).resize(300, 200).toFile(fileUrl, function (err) {
                if (err) {
                    console.log(err)
                }
            });

            const str = E.originalname;
            const extension = str.substr(str.lastIndexOf(".") + 1);

            const fJson = {
                file: E.filename,
                title: E.originalname,
                file_type: extension,
                file_size: E.size
            }
            if (E.fieldname === 'banner') {
                banner.push(fJson);
            }
            if (E.fieldname === 'videos') {
                vidoes.push(fJson);
            }
        });

        let thumbnailBanner = [];

        if (banner.length) {
            thumbnailBanner = banner.map(x => 'thumbnail/' + x.file);
        }

        productJson.banner = banner;
        productJson.thumbnailBanner = thumbnailBanner;
        productJson.vidoes = vidoes;

        Plans.create(productJson).then((data) => {
            res.send({ status: true, data: data._id })
            return;
        }).catch((err) => {
            res.send({ status: false, message: err.message })
            return;
        });

    } catch (e) {
        console.log(e)
        res.send({ status: false, message: "Something went wrong!" });
    }
}

exports.updatePlans = async (req, res, next) => {
    try {
        const reqBody = req.body;
        const reqFiles = req.files;

        if (!reqBody._id) {
            res.send({ status: false, message: "Id is required" });
            return;
        }

        const banner = [];
        const vidoes = [];

        reqFiles.forEach(E => {

            var filePath = path.join(__dirname, '../public/thumbnail/');

            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath);
            }

            const fileUrl = filePath + E.filename;

            sharp(E.path).resize(300, 200).toFile(fileUrl, function (err) {
                if (err) {
                    console.log(err)
                }
            });

            const str = E.originalname;
            const extension = str.substr(str.lastIndexOf(".") + 1);

            const fJson = {
                file: E.filename,
                title: E.originalname,
                file_type: extension,
                file_size: E.size
            }
            if (E.fieldname === 'banner') {
                banner.push(fJson);
            }
            if (E.fieldname === 'videos') {
                vidoes.push(fJson);
            }
        });

        let thumbnailBanner = [];

        reqBody.$push = {}

        reqBody.$push.banner = banner;
        reqBody.$push.thumbnailBanner = banner.map(x => 'thumbnail/' + x.file);
        reqBody.$push.vidoes = vidoes;

        const updated = await Plans.findByIdAndUpdate(reqBody._id, reqBody);

        if (!updated) {
            return res.send({ status: false, message: 'Plan not found' })
        }

        return res.send({ status: true, message: 'Updated Successfully' })

    } catch (error) {
        return res.send({ status: false, message: error.message });
    }
}


exports.getByIdPlan = async (req, res, next) => {
    try {
        const reqQuery = req.query;
        const Id = reqQuery._id;

        if (!Id) {
            return res.send({ status: false, message: 'Id is required' });
        }

        const data = await Plans.findById(Id).populate('products').lean().exec();

        if (!data) {
            return res.send({ status: false, message: 'data not found for this id' });
        }

        return res.send({ status: true, data: data, message: 'Get successfully' });
    } catch (error) {
        return res.send({ status: false, message: error.message });
    }
}

exports.getAllPlan = async (req, res, next) => {
    try {
        const reqBody = req.body;
        const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
        const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;

        const data = await Plans.find().populate('products').sort({ updated: -1 }).skip(Limit * PageNo).limit(Limit).lean().exec();
        const count = await Plans.find().lean().exec();

        return res.send({ status: true, data: data, message: 'Get successfully', count: count.length });
    } catch (error) {
        return res.send({ status: false, message: error.message });
    }
}

exports.deletePlan = async (req, res, next) => {
    try {
        const reqQuery = req.query;
        const _id = reqQuery._id;

        if (!_id) { return res.send({ status: false, message: "Id is required" }) }

        const data = await Plans.findByIdAndDelete(_id).lean().exec();

        if (!data) {
            return res.send({ status: false, message: `Data not found` })
        }

        return res.send({ status: true, message: "Deleted Successfully" });

    } catch (error) {
        return res.send({ status: false, message: (error.message || "Something went wrong") });
    }
}


// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDJmOWYxNWU0ZDgzMjc1OTc4NWM1MWMiLCJzb2NpYWxpZCI6bnVsbCwidHlwZV9sb2dpbiI6bnVsbCwib3RwIjoiMTg4MiIsIm1vYmlsZV9vdHAiOiI4NDk4IiwiZ3N0aW4iOmZhbHNlLCJmc3NhaSI6ZmFsc2UsImlzRW1haWxWZXJpZmllZCI6dHJ1ZSwiaXNNb2JpbGVWZXJpZmllZCI6ZmFsc2UsImlzQnVzc2luZXNzVmVyaWZpZWQiOnRydWUsImlwX2FkZHJlc3MiOm51bGwsIm5vX29mX2xvZ2dlZGluIjowLCJsYXN0X2xvZ2luX3RpbWUiOm51bGwsInVzZXJfc3RhdHVzIjoiYWN0aXZlIiwiZW1haWwiOiJhYmhpcGFuY2hhbDA5OEBnbWFpbC5jb20iLCJ1c2VybmFtZSI6InRlczR0IiwicGFzc3dvcmQiOiIkMmIkMTAkWDRqS2hsQzVrLk03a0FXcW9NdGRsLmVNcDZVUXR3UlJOYWNmay51Y2Y3NVk1RGk2aFlwbzIiLCJyb2xlcyI6IlNFTExFUiIsIm1vYmlsZV9udW1iZXIiOiI2NjY2NjY2NjY2IiwiX192IjowLCJub3RlIjpudWxsLCJpYXQiOjE2MTQ4NTA2MTd9.JZ7nssqPZ4xuvMuo_R26PqAGVJQiHvDHTftpN-S99V0