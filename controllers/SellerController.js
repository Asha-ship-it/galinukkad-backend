const db = require('../_helper/db');
const Campaign = db.Campaign;
const ProductModel = db.Product;
const ChatGroup = db.ChatGroup;
const UserLogins = db.UserLogins;
const ChatMessage = db.ChatMessage;
const AdvPlan = db.AdvPlan;
const AdvPlanBook = db.AdvPlanBook;
const NewsCategory = db.NewsCategory;
const NewsArticle = db.NewsArticle;
const Communication = db.Communication;
const Order = db.Order;
const Visitor_Graph = db.Visitor_Graph;

var ROLES = require('../config.json').ROLES;

let mongoose = require('mongoose');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const { Validator } = require('node-input-validator');
module.exports = {

    createCampaign: async (req, res, next) => {
        try {
            let v = new Validator(req.body, { //validator 
                campaign_name: 'required',
                daily_budget: 'required',
                budget: 'required',
                start_date: 'required',
                end_date: 'required',
                name_of_group: 'required',
                products: 'required',
            })
            let check = await v.check();
            if (!check) {
                res.status(422).json({
                    statusCode: 422,
                    message: 'Please enter all required field',
                });
            } else {
                let data = {
                    name: req.body.campaign_name,
                    daily_budget: req.body.daily_budget,
                    start_date: req.body.start_date,
                    end_date: req.body.end_date,
                    name_of_group: req.body.name_of_group,
                    products: req.body.products,
                    default_bid: req.body.default_bid,
                    budget: req.body.budget,
                    status: req.body.status,
                    loginid: req.user._id

                }
                Campaign.create(data).then(user => {
                    res.send({ status: true, message: "Campaign created!", result: user });
                }).catch(err => {
                    console.log(err)
                    res.send({ status: false, message: (err.message || "Something went wrong!") });
                })
            }
        } catch (e) {
            console.log(e)
            res.send({ status: false, message: "Something went wrong!" });
        }
    },

    listCampaign: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
            const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;
            let campaign = await Campaign.find({ loginid: req.user._id }).limit(Limit).skip(Limit * PageNo).sort({ updated_at: -1 });
            let campaignLength = await Campaign.find({ loginid: req.user._id });
            if (campaign.length > 0) {
                res.send({ status: true, message: "Record found!", result: campaign, count: campaignLength.length });
            } else {
                res.send({ status: false, message: "No data found!" });
            }
        } catch (e) {
            res.send({ status: false, message: "Something went wrong!" });
        }
    },

    listAllCampaign: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
            const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;
            let campaign = await Campaign.find({}).limit(Limit).skip(Limit * PageNo).sort({ updated_at: -1 });
            let campaignLen = await Campaign.find({});
            if (campaign.length > 0) {
                res.send({ status: true, message: "Record found!", result: campaign, count: campaignLen.length });
            } else {
                res.send({ status: false, message: "No data found!" });
            }
        } catch (e) {
            return res.send({ status: false, message: "Something went wrong!" });
        }
    },

    campaignDetail: async (req, res, next) => {
        try {
            let campaign = await Campaign.findOne({ _id: req.body.campaign_id })
            if (!campaign) {
                res.send({ status: false, message: "Record not found!" });
                return
            }

            let products = await ProductModel.find({ _id: { $in: campaign.products } })
            let result = {
                campaign: campaign,
                product: products
            }

            res.send({ status: true, message: "record found", result });

        } catch (e) {
            console.log(e)
            res.send({ status: false, message: "Something went wrong!" });
        }
    },

    updateCampaignStatus: async (req, res, next) => {
        try {
            let v = new Validator(req.body, { //validator 
                campaign_id: 'required',
                status: 'required',
            })
            let check = await v.check();
            if (!check) {
                res.status(422).json({
                    statusCode: 422,
                    message: 'Please enter all required field',
                });
            } else {
                let campaign = Campaign.findOne({ _id: req.body.campaign_id })
                if (!campaign) {
                    res.send({ status: false, message: "Campaign not found" });
                    return
                }
                Campaign.updateOne({ _id: req.body.campaign_id }, { $set: { status: req.body.status } }).then(user => {
                    res.send({ status: true, message: "record updated!" });
                }).catch(err => {
                    res.send({ status: false, message: "Something went wrong!" });
                })
            }

        } catch (e) {
            res.send({ status: false, message: "Something went wrong!" });
        }
    },

    updateCampaign: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const Id = reqBody.campaign_id;

            if (!Id) {
                return res.send({ status: false, message: 'Id is required' });
            }

            const updated = await Campaign.findByIdAndUpdate(Id, reqBody);

            if (!updated) {
                return res.send({ status: false, message: 'Record not found' });
            }
            return res.send({ status: true, message: 'Updated Successfully' });

        } catch (e) {
            res.send({ status: false, message: "Something went wrong!" });
        }
    },

    deleteCampaign: async (req, res, next) => {
        try {
            let v = new Validator(req.body, { //validator 
                campaign_id: 'required',

            })
            let check = await v.check();
            if (!check) {
                res.status(422).json({
                    statusCode: 422,
                    message: 'Please enter all required field',
                });
            } else {
                let campaign = Campaign.findOne({ _id: req.body.campaign_id })
                if (!campaign) {
                    res.send({ status: false, message: "Campaign not found" });
                    return
                }
                Campaign.deleteOne({ _id: req.body.campaign_id }).then(user => {
                    res.send({ status: true, message: "record deleted!" });
                }).catch(err => {
                    res.send({ status: false, message: "Something went wrong!" });
                })
            }

        } catch (e) {
            res.send({ status: false, message: "Something went wrong!" });
        }
    },

    startChatting: async (req, res, next) => {
        let v = new Validator(req.body, { //validator 
            receiver_id: 'required',
            message: 'required'
        })
        let check = await v.check();
        if (!check) {
            res.status(422).json({
                statusCode: 422,
                message: 'Please enter all required field',
            });
        } else {
            let chatGroup = await ChatGroup.findOne({ $or: [{ sender_id: req.body.receiver_id, receiver_id: req.user._id }, { sender_id: req.user._id, receiver_id: req.body.receiver_id }] })
            if (chatGroup) {
                let chat_message = {
                    chat_group_id: chatGroup._id,
                    message: req.body.message,
                    sender_id: req.user._id
                }
                let user = await ChatMessage.create(chat_message)
                res.send({ status: true, message: "Record found!", user });
            } else {
                let chat_group = {
                    sender_id: req.user._id,
                    receiver_id: req.body.receiver_id
                }
                ChatGroup.create(chat_group).then(user => {
                    let chat_message = {
                        chat_group_id: user._id,
                        message: req.body.message,
                        sender_id: req.user._id
                    }
                    ChatMessage.create(chat_message).then(user => {
                        res.send({ status: true, message: "Record found!", user });
                    }).catch(err => {
                        res.send({ status: false, message: "Something went wrong!" });
                    })
                }).catch(err => {
                    res.send({ status: false, message: "Something went wrong!" });
                })
            }
        }
    },
    listMessages: async (req, res, next) => {
        let v = new Validator(req.body, { //validator 
            chat_group_id: 'required',

        })
        let check = await v.check();
        if (!check) {
            res.status(422).json({
                statusCode: 422,
                message: 'Please enter all required field',
            });
        } else {
            let chats = await ChatGroup.aggregate([
                { $match: { _id: mongoose.Types.ObjectId(req.body.chat_group_id) } },

            ])

            if (chats.length > 0) {
                let chat_messages = await ChatMessage.find({ chat_group_id: chats[0]._id })
                let sender = await UserLogins.find({ _id: chats[0].sender_id })
                let receiver = await UserLogins.find({ _id: chats[0].receiver_id })
                chats[0].sender = sender.length > 0 ? sender[0] : []
                chats[0].receiver = receiver.length > 0 ? receiver[0] : []
                chats[0].chat_message = chat_messages.length > 0 ? chat_messages : []
                res.send({ status: true, message: "Record found!", chats });
            } else {
                res.send({ status: false, message: "Record not found!" });
            }
        }
    },
    chatGroup: async (req, res, next) => {
        let v = new Validator(req.body, { //validator 
            sender_id: 'required',
        })
        let check = await v.check();
        if (!check) {
            res.status(422).json({
                statusCode: 422,
                message: 'Please enter all required field',
            });
        } else {
            let chatGroup = await ChatGroup.find({ $or: [{ sender_id: req.body.sender_id }, { receiver_id: req.body.sender_id }] })

            let arr = [];
            if (chatGroup.length > 0) {
                for (let i = 0; i < chatGroup.length; i++) {
                    let chatMessage = await ChatMessage.findOne({ chat_group_id: chatGroup[i]._id })
                    arr.push({
                        'chat_group_id': chatGroup[i]._id,
                        'sender_id': chatGroup[i].sender_id,
                        'receiver_id': chatGroup[i].receiver_id,
                        'message': chatMessage,
                    })

                }
                res.send({ status: true, message: "Record found!", arr });
            } else {
                res.send({ status: false, message: "Record not found!" });
            }
        }
    },
    accountHealth: async (req, res, next) => {
        try {

        } catch (err) {
            res.send({ status: false, message: "Something went wrong" });
        }
    },

    // Advtisement
    getActiveAdvPlanList: async (req, res, next) => {
        try {
            const { filter, page, limit } = req.body;
            let p = page ? parseInt(page) : 0;
            let l = limit ? parseInt(limit) : 10;

            let advPlanBooked = await AdvPlanBook.aggregate([
                { $lookup: { from: 'userlogins', localField: 'seller_id', foreignField: '_id', as: 'users' } },
                { $lookup: { from: 'advplans', localField: 'advplan_id', foreignField: '_id', as: 'plan' } },
                { "$skip": l * p },
                { "$limit": l }
            ]);
            if (advPlanBooked.length > 0) {
                res.send({ status: true, message: "Record found!", result: advPlanBooked, count: advPlanBooked.length });
            } else {
                res.send({ status: false, message: "No data found!", result: [], count: 0 });
            }
        } catch (e) {
            res.send({ status: false, message: "Something went wrong!" });
        }
    },
    getAdvPlanList: async (req, res, next) => {
        try {
            let advplan = await AdvPlan.find({})
            if (advplan.length > 0) {
                let bookedPlan = await AdvPlanBook.findOne({ seller_id: req.body.seller_id })
                res.send({ status: true, message: "Record found!", result: { advplan: advplan, bookedPlan: bookedPlan }, count: advplan.length });
            } else {
                res.send({ status: false, message: "No data found!" });
            }
        } catch (e) {
            res.send({ status: false, message: "Something went wrong!" });
        }
    },
    bookAdvPlan: async (req, res, next) => {
        try {
            let advplan = await AdvPlan.findOne({ _id: req.body.planId })
            if (advplan) {
                let data = {
                    seller_id: req.body.seller_id,
                    advplan_id: req.body.planId,
                    price: advplan.price
                }
                AdvPlanBook.create(data).then(user => {
                    res.send({ status: true, message: "Plan Activated" });
                })
            } else {
                res.send({ status: false, message: "Plan Not Found" });
            }
        } catch (err) {
            res.send({ status: false, message: "Something went wrong" });
        }

    },
    deleteBookPlan: async (req, res, next) => {
        try {
            AdvPlanBook.deleteOne({ _id: req.body.planId }).then(user => {
                res.send({ status: true, message: "record deleted!" });
            }).catch(err => {
                res.send({ status: false, message: "Something went wrong!" });
            })
        } catch (err) {
            res.send({ status: false, message: "Something went wrong" });
        }

    },
    // News
    getNewsCategoryList: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
            const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;

            const catLent = await NewsCategory.count({ status: 0 });

            NewsCategory.find({ status: 0 }).sort({ updated_at: -1 }).limit(Limit).skip(Limit * PageNo).then(category => {
                res.send({ status: true, message: "Category List", result: category, count: catLent });
            })
        } catch (err) {
            res.send({ status: false, message: "Something went wrong" });
        }
    },

    createNewsCategory: async (req, res, next) => {
        try {
            if (req.body.category_name) {
                let data = {
                    category_name: req.body.category_name
                }
                NewsCategory.create(data).then(user => {
                    res.send({ status: true, message: "Category Created" });
                }).catch(e => {
                    res.send({ status: false, message: e.message });
                })
            } else {
                res.send({ status: false, message: "Something went wrong" });
            }
        } catch (err) {
            res.send({ status: false, message: "Something went wrong" });
        }
    },
    updateNewsCategory: async (req, res, next) => {
        try {
            if (req.body.id && req.body.category_name) {
                NewsCategory.findOneAndUpdate({ _id: req.body.id }, { $set: { category_name: req.body.category_name } }).then(user => {
                    res.send({ status: true, message: "Category Successfully updated" });
                }).catch(e => {
                    res.send({ status: false, message: e.message });
                })
            } else {
                res.send({ status: false, message: "Something went wrong" });
            }
        } catch (err) {
            res.send({ status: false, message: "Something went wrong" });
        }
    },
    deleteNewsCategory: async (req, res, next) => {
        try {
            if (req.body.id) {
                NewsCategory.findOneAndUpdate({ _id: req.body.id }, { $set: { status: 1 } }).then(user => {
                    res.send({ status: true, message: "Category Successfully deleted" });
                }).catch(e => {
                    res.send({ status: false, message: e.message });
                })
            } else {
                res.send({ status: false, message: "Something went wrong" });
            }
        } catch (err) {
            res.send({ status: false, message: "Something went wrong" });
        }
    },
    listNewsArticle: async (req, res, next) => {
        try {
            const { filter, page, limit } = req.body;
            let p = page ? parseInt(page) : 0;
            let l = limit ? parseInt(limit) : 10;

            let articles = await NewsArticle.aggregate([
                { $lookup: { from: 'newscategories', localField: 'category_id', foreignField: '_id', as: 'category' } },
                { "$match": { status: 0 } },
                { "$skip": l * p },
                { "$limit": l },
            ])

            const aLeng = await NewsArticle.count({ status: 0 });

            if (articles.length > 0) {
                res.send({ status: true, message: "Record found!", result: articles, count: aLeng });
            } else {
                res.send({ status: false, message: "No data found!", result: [], count: 0 });
            }
        } catch (err) {
            res.send({ status: false, message: "Something went wrong" });
        }
    },

    createNewsArticle: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const reqFiles = req.files;

            const imagesArray = [];
            const thumbnailArray = [];
            if (reqFiles) {
                reqFiles.forEach(E => {
                    var filePath = path.join(__dirname, '../public/thumbnail/');

                    if (!fs.existsSync(filePath)) {
                        fs.mkdirSync(filePath);
                    }

                    const fileUrl = filePath + E.filename;

                    sharp(E.path).resize(300, 200).toFile(fileUrl, function (err) {
                        if (err) {
                            console.log(err);
                        }
                        console.log('FILEEEEEEEE', fileUrl);
                    });

                    thumbnailArray.push(`thumbnail/${E.filename}`);

                    const str = E.originalname;
                    const extension = str.substr(str.lastIndexOf(".") + 1);
                    const fJson = {
                        file: E.filename,
                        title: E.originalname,
                        file_type: extension,
                        file_size: E.size
                    };

                    imagesArray.push(fJson);
                });
            }

            reqBody.images = imagesArray;
            reqBody.thumbnail = thumbnailArray;

            NewsArticle.create(reqBody).then(item => {
                res.send({ status: true, message: "News Article Added!" });
            }).catch(e => {
                res.send({ status: false, message: e.message });
            })
        } catch (err) {
            res.send({ status: false, message: err.message });
        }
    },
    updateNewsArticle: async (req, res, next) => {
        try {

            const reqBody = req.body;
            const reqFiles = req.files;
            const _id = reqBody._id;

            if (!_id) {
                return res.send({ status: false, message: "Id is required" });
            }

            const imagesArray = [];
            const thumbnailArray = [];
            if (reqFiles && reqFiles.length) {
                reqFiles.forEach(E => {
                    var filePath = path.join(__dirname, '../public/thumbnail/');

                    if (!fs.existsSync(filePath)) {
                        fs.mkdirSync(filePath);
                    }

                    const fileUrl = filePath + E.filename;

                    sharp(E.path).resize(300, 200).toFile(fileUrl, function (err) {
                        if (err) {
                            console.log(err);
                        }
                        console.log('FILEEEEEEEE', fileUrl);
                    });

                    thumbnailArray.push(`thumbnail/${E.filename}`);

                    const str = E.originalname;
                    const extension = str.substr(str.lastIndexOf(".") + 1);
                    const fJson = {
                        file: E.filename,
                        title: E.originalname,
                        file_type: extension,
                        file_size: E.size
                    };

                    imagesArray.push(fJson);
                });

                reqBody.$addToSet = { images: imagesArray, thumbnail: thumbnailArray };
            }

            NewsArticle.findOneAndUpdate({ _id: _id }, reqBody).then(item => {
                res.send({ status: true, message: "News Article Updated!" });
            }).catch(e => {
                res.send({ status: false, message: e.message });
            });
        } catch (err) {
            res.send({ status: false, message: "Something went wrong" });
        }
    },
    deleteNewsArticle: async (req, res, next) => {
        try {
            if (req.body.id) {
                NewsArticle.findOneAndUpdate({ _id: req.body.id }, { $set: { status: 1 } }).then(user => {
                    res.send({ status: true, message: "Article Successfully deleted" });
                }).catch(e => {
                    res.send({ status: false, message: e.message });
                })
            } else {
                res.send({ status: false, message: "Something went wrong" });
            }
        } catch (err) {
            res.send({ status: false, message: "Something went wrong" });
        }
    },
    listNewsArticleCategoryWise: async (req, res, next) => {
        try {
            let articles = await NewsCategory.aggregate([
                { "$match": { status: 0 } },
                {
                    $lookup: {
                        from: 'newsarticles',
                        as: 'articles',
                        let: { indicator_id: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$category_id', '$$indicator_id'] }
                                }
                            },
                            { $sort: { updated_at: -1 } },
                            { $limit: 4 }
                        ]
                    }
                }
            ])

            if (articles.length > 0) {
                res.send({ status: true, message: "Record found!", result: articles, count: articles.length });
            } else {
                res.send({ status: false, message: "No data found!", result: [], count: 0 });
            }
        } catch (err) {
            res.send({ status: false, message: "Something went wrong" });
        }
    },
    listNewsArticleCategoryWiseByCategoryId: async (req, res, next) => {
        try {
            if (req.body.category_id) {
                const reqBody = req.body;
                const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
                const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;

                let categoryid = req.body.category_id;
                let articles = await NewsCategory.aggregate([
                    { "$match": { _id: mongoose.Types.ObjectId(categoryid), status: 0 } },
                    {
                        $lookup: {
                            from: 'newsarticles',
                            as: 'articles',
                            let: { indicator_id: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $eq: ['$category_id', '$$indicator_id'] }
                                    }
                                },
                                { $sort: { created_at: -1 } }
                            ]
                        }
                    },
                    { $skip: Limit * PageNo },
                    { $limit: Limit }
                ])

                if (articles.length > 0) {
                    res.send({ status: true, message: "Record found!", result: articles, count: articles.length });
                } else {
                    res.send({ status: false, message: "No data found!", result: [], count: 0 });
                }
            } else {
                res.send({ status: false, message: 'Category id is required' });
            }
        } catch (err) {
            res.send({ status: false, message: "Something went wrong" });
        }
    },


    listNewsArticleCategoryWise: async (req, res, next) => {
        try {

            let articles = await NewsCategory.aggregate([
                { "$match": { status: 0 } },
                {
                    $lookup: {
                        from: 'newsarticles',
                        as: 'articles',
                        let: { indicator_id: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$category_id', '$$indicator_id'] }
                                }
                            },
                            { $sort: { created_at: -1 } },
                            // { $skip: (Limit * PageNo) },
                            // { $limit: Limit },
                        ]
                    }
                }
            ])

            if (articles.length > 0) {
                res.send({ status: true, message: "Record found!", result: articles, count: articles.length });
            } else {
                res.send({ status: false, message: "No data found!", result: [], count: 0 });
            }
        } catch (err) {
            res.send({ status: false, message: "Something went wrong" });
        }
    },


    newsArticleCategoryWiseByArticleId: async (req, res, next) => {
        try {
            if (req.body.article_id) {
                let articleId = req.body.article_id;
                let articles = await NewsArticle.aggregate([
                    { "$match": { _id: mongoose.Types.ObjectId(articleId), status: 0 } },
                    {
                        $lookup: {
                            from: 'newscategories',
                            as: 'categories',
                            let: { indicator_id: '$category_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $eq: ['$_id', '$$indicator_id'] }
                                    }
                                }
                            ]
                        }
                    }
                ])

                if (articles.length > 0) {
                    res.send({ status: true, message: "Record found!", result: articles, count: articles.length });
                } else {
                    res.send({ status: false, message: "No data found!", result: [], count: 0 });
                }
            } else {
                res.send({ status: false, message: "Something went wrong" });
            }

        } catch (err) {
            res.send({ status: false, message: "Something went wrong" });
        }
    },
    getProductAvailable: async (req, res, next) => {
        try {
            if (req.body.sellerId) {
                let l = req.body.limit || 10;
                let p = req.body.page || 00;
                let s = (req.body.sort == 'asc') ? 1 : -1;
                let sellerId = req.body.sellerId;

                let products = await ProductModel.find({ loginid: sellerId }).limit(l).skip(l * p).sort({ _id: -1 });
                res.send({ status: true, message: "Record found!", result: products, count: products.length })
            } else {
                res.send({ status: false, message: "Null Param!" });
            }
        } catch (err) {
            res.send({ status: false, message: "Something went wrong" });
        }
    },
    createCommunication: async (req, res, next) => {
        try {
            const sellerId = req.user._id;

            // let communication = await Communication.find({ loginid: sellerId });
            // if (communication && communication.length > 0) {
            //     let data = {
            //         product_details: req.body.product_details,
            //         specification: req.body.specification,
            //         shipping_details: req.body.shipping_details,
            //         quality_details: req.body.quality_details,
            //         manufaturer_details: req.body.manufaturer_details,
            //         product_sources: req.body.product_sources
            //     };
            //     Communication.updateOne({ loginid: sellerId }, { $set: data }).then(user => {
            //         return res.send({ status: true, message: "Communicate updated!", result: user });
            //     }).catch(err => {
            //         return res.send({ status: false, message: err.message });
            //     })
            // } else {
            let data = {
                loginid: sellerId,
                product_details: req.body.product_details,
                specification: req.body.specification,
                shipping_details: req.body.shipping_details,
                quality_details: req.body.quality_details,
                manufaturer_details: req.body.manufaturer_details,
                product_sources: req.body.product_sources
            }
            Communication.create(data).then(user => {
                return res.send({ status: true, message: "Communicate created!", result: user });
            }).catch(err => {
                return res.send({ status: false, message: err.message });
            })
            // }
        } catch (err) {
            return res.send({ status: false, message: err.message });
        }
    },

    getAllCommunication: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
            const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;

            let communication = await Communication.aggregate([
                { $lookup: { from: 'userlogins', localField: 'loginid', foreignField: '_id', as: 'seller' } },
                { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
                { $skip: Limit * PageNo },
                { $limit: Limit }
            ]);
            let count = await Communication.countDocuments();

            if (communication.length > 0) {
                res.send({ status: true, message: "Record found!", result: communication, count: count });
            } else {
                res.send({ status: false, message: "Record not found" });
            }
        } catch (e) {
            res.send({ status: false, message: e.message });
        }
    },
    getCommunication: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
            const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;
            const sellerId = req.user._id;

            if (!sellerId) {
                return res.send({ status: false, message: "Unauthorized" });
            }

            let communication = await Communication.aggregate([
                { $lookup: { from: 'userlogins', localField: 'loginid', foreignField: '_id', as: 'seller' } },
                { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
                { $match: { loginid: mongoose.Types.ObjectId(sellerId) } },
                { $skip: Limit * PageNo },
                { $limit: Limit }
            ]);
            let count = await Communication.countDocuments({ loginid: sellerId });

            if (communication.length > 0) {
                res.send({ status: true, message: "Record found!", result: communication, count: count });
            } else {
                res.send({ status: false, message: "Record not found" });
            }

        } catch (e) {
            res.send({ status: false, message: e.message });
        }
    },

    getCommunicationProductId: async (req, res, next) => {
        try {

            if (!req.body.product_id) {
                return res.send({ status: false, message: "Product Id is Required" });
            }

            const isProduct = await ProductModel.findById(req.body.product_id);

            if (!isProduct) {
                return res.send({ status: false, message: "Product not found" });
            }

            const sellerId = isProduct.loginid;

            let communication = await Communication.aggregate([
                { $lookup: { from: 'userlogins', localField: 'loginid', foreignField: '_id', as: 'seller' } },
                { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
                { $match: { loginid: mongoose.Types.ObjectId(sellerId) } }
            ]);

            let count = await Communication.countDocuments({ loginid: sellerId });

            if (communication.length > 0) {
                res.send({ status: true, message: "Record found!", result: communication, count: count });
            } else {
                res.send({ status: false, message: "Record not found" });
            }

        } catch (e) {
            res.send({ status: false, message: "Something went wrong!" });
        }
    },

    getAllSellerList: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const Limit = parseInt(reqBody.limit) || 10;
            const PageNo = parseInt(reqBody.pageno) || 0;

            const sellers = await UserLogins.aggregate([
                { $lookup: { from: 'profiles', localField: '_id', foreignField: "loginid", as: "profileInfo" } },
                { $lookup: { from: 'bussinesses', localField: '_id', foreignField: "loginid", as: "bussinessInfo" } },
                { $unwind: { path: '$profileInfo', preserveNullAndEmptyArrays: true } },
                { $match: { roles: ROLES[1] } },
                { $skip: (PageNo * Limit) },
                { $limit: Limit },
                {
                    $project: {
                        'password': 0,
                        'bussinessInfo.loginid': 0,
                        'profileInfo.loginid': 0
                    }
                },
            ]);

            return res.send({ status: true, data: sellers, message: 'Sellers with Bussiness Profile get successfully' });
        } catch (error) {
            return res.send({ status: false, message: error.message });
        }

    },


    deleteUserByUserId: async (req, res, next) => {
        const id = req.query.id;
        if (!id) {
            res.send({ status: false, message: "Not valid id" });
            return;
        }
        UserLogins.deleteOne({ _id: id }).then(userlist => {
            res.send({ status: true, data: userlist })
        }).catch(e => {
            res.send({ status: false, message: "somthing went wrong " })
        })

    },

    sellerAccountHealthById: async (req, res, next) => {

        try {
            const reqBody = req.body;
            const sellerId = reqBody.seller_id;
            if (!sellerId) {
                return res.send({ status: false, message: "Seller Id is required" });
            }

            let result = {};

            const totalOrder = await sellerOrderFilter(sellerId, {});
            const placedOrder = await sellerOrderFilter(sellerId, { status: 0 });
            const deliveredOrder = await sellerOrderFilter(sellerId, { status: 1 });
            const canceledOrder = await sellerOrderFilter(sellerId, { status: 2 });
            const returnOrder = await sellerOrderFilter(sellerId, { status: 3 });
            const refundOrder = await sellerOrderFilter(sellerId, { status: 4 });

            result = {
                totalOrder: totalOrder.length,
                placeOrder: {
                    // orders: placedOrder,
                    count: placedOrder.length,
                    percentage: statusPercentage(placedOrder, totalOrder)
                },
                deliveredOrder: {
                    // orders: deliveredOrder,
                    count: deliveredOrder.length,
                    percentage: statusPercentage(deliveredOrder, totalOrder)
                },
                canceledOrder: {
                    // orders: canceledOrder,
                    count: canceledOrder.length,
                    percentage: statusPercentage(canceledOrder, totalOrder)
                },
                returnOrder: {
                    // orders: returnOrder,
                    count: returnOrder.length,
                    percentage: statusPercentage(returnOrder, totalOrder)
                },
                refundOrder: {
                    // orders: refundOrder,
                    count: refundOrder.length,
                    percentage: statusPercentage(refundOrder, totalOrder)
                },
            }

            res.send({ status: true, data: result });


        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    getVisitarGraphInfoById: async (req, res, next) => {
        try {
            const userId = req.user._id;

            const MATCH = {};
            MATCH.$and = [];

            // for seller
            if (req.user && req.user.role == ROLES[1]) {
                MATCH.$and.push({ seller_id: mongoose.Types.ObjectId(userId) });
            }

            if (!MATCH.$and.length) {
                delete MATCH.$and;
            }

            const visitoList = await Visitor_Graph.aggregate([
                { $match: MATCH },
                {
                    $lookup: { from: "products", localField: "product_id", foreignField: "_id", as: "product" }
                },
                {
                    $lookup: { from: "userlogins", localField: "loginid", foreignField: "_id", as: "loginid" }
                },
                { $unwind: { path: '$loginid', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: "$product_id", productVisitCount: { $sum: 1 }
                    }
                },
            ]);

            for (let i = 0; i < visitoList.length; i++) {
                const proId = visitoList[i]._id;
                const product = await ProductModel.findById(proId).lean().exec();
                if (product) {
                    visitoList[i].productInfo = {
                        title: product.title,
                        price: product.price,
                        sale_price: product.sale_price
                    };
                } else {
                    visitoList[i].productInfo = {};
                }
            }

            return res.send({ status: true, data: visitoList, message: 'Information get successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    getVisitarGraphInfoByMonthYear: async (req, res, next) => {
        try {
            const userId = req.user._id;

            const MATCH = {};
            MATCH.$and = [];

            // for seller
            if (req.user && req.user.role == ROLES[1]) {
                MATCH.$and.push({ seller_id: mongoose.Types.ObjectId(userId) });
            }

            if (!MATCH.$and.length) {
                delete MATCH.$and;
            }

            const visitoList = await Visitor_Graph.aggregate([
                { $match: MATCH },
                {
                    $lookup: { from: "products", localField: "product_id", foreignField: "_id", as: "product" }
                },
                {
                    $lookup: { from: "userlogins", localField: "loginid", foreignField: "_id", as: "loginid" }
                },
                { $unwind: { path: '$loginid', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: {
                            month: { $month: "$created_at" },
                            year: { $year: "$created_at" }
                        },
                        productInfo: {
                            $push: {
                                title: "$product.title",
                                price: "$product.price",
                                sale_price: "$product.sale_price"
                            }
                        },
                        productVisitCount: { $sum: 1 }
                    }
                },
            ]);

            return res.send({ status: true, data: visitoList, message: 'Information get successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    }

}


function sellerOrderFilter(sellerId, fields = {}) {
    return new Promise(async (resolve, reject) => {
        try {
            fields.seller_id = { $in: [mongoose.Types.ObjectId(sellerId)] };

            const MATCH = {};
            MATCH.$and = [];

            Object.keys(fields).forEach(E => {
                if (fields[E] !== '') {
                    MATCH.$and.push({ [E]: fields[E] })
                }
            });

            const list = await Order.aggregate([
                { $match: MATCH }
            ]);

            for (let i = 0; i < list.length; i++) {
                const E = list[i];
                const proArray = [];
                if (E.product) {
                    for (let j = 0; j < E.product.length; j++) {
                        const E2 = E.product[j];
                        if (E2.id) {
                            const product = await ProductModel.findOne({ _id: mongoose.Types.ObjectId(E2.id), loginid: mongoose.Types.ObjectId(sellerId) });
                            if (product) {
                                proArray.push({ id: product._id, quantity: E2.quantity });
                            }
                        }
                    }
                }
                E.product = proArray;
            }
            resolve(list);
        } catch (error) {
            console.log(error.message)
            resolve([])
        }
    })
}

function statusPercentage(status, total) {
    return ((status.length / total.length) * 100) ?
        (((status.length / total.length) * 100).toFixed(2)) + '%' : '0.00%'
}
