const db = require('../_helper/db');
const Product = db.Product;
const Review = db.Review;
const accessTokenSecret = require('../config.json').jwd_secret;
var ROLES = require('../config.json').ROLES;
const jwt = require('jsonwebtoken');
const { Address, Compare_product, Sub_Category } = require('../_helper/db');
var request = require('request');
const RecentViewed = db.RecentViewed;
const productQuesAns = db.productQuesAns;
const Notification = db.Notification;
const Order = db.Order;
const Category = db.Category;
let mongoose = require('mongoose')
var keyword_extractor = require("keyword-extractor");
const UserLogins = db.UserLogins;
const KeywordsModel = db.Keywords;
const excel = require('exceljs');
const readXlsxFile = require('read-excel-file/node');
const sharp = require('sharp');
var path = require('path');
var fs = require('fs');

notEmpty = (obj) => {
    let t = Object.keys(obj).filter(i => (obj[i] == undefined || obj[i].toString().length == 0));
    if (t.length > 0) {
        return false;
    } else {
        return true;
    }
};

module.exports = {

    createProduct: (req, res, next) => {

        const {
            title,
            is_featured,
            is_hot,
            is_sale,
            is_active,
            price,
            sale_price,
            vendor,
            reviewcount,
            is_out_of_stock,
            depot,
            inventory,
            created_at,
            updated_at,
            productId,
            variants,
            category,
            subCategory,
            images,
            thumbnail,
            description,
            spec,
            color,
            productFeatures,
            location,
            keywords,
            rewardpoint
        } = req.body;

        const loginid = req.user._id;

        const reqBody = req.body;
        const reqFiles = req.files;

        if (!title || !price || !vendor) {
            res.send({ status: false, message: "Required Parameter is missing" });
            return;
        }

        const productJson = {
            title: title,
            is_featured: is_featured || 0,
            is_hot: is_hot || 0,
            productFeatures: productFeatures ? productFeatures : [],
            is_sale: is_sale || 0,
            is_active: is_active || 0,
            vendor: vendor,
            reviewcount: reviewcount || 0,
            is_out_of_stock: is_out_of_stock || 0,
            depot: depot || 0,
            inventory: inventory || 0,
            category: category,
            subCategory: subCategory,
            loginid: loginid,
            description: description || '',
            spec: spec || '',
            color: color || [],
            location: location || [],
            keywords: keywords || [],
            rewardpoint: rewardpoint || 0,

            price: price,
            sale_price_date_from: reqBody.sale_price_date_from,
            sale_price_date_to: reqBody.sale_price_date_to,
            sale_price: (sale_price || 0),

            sku: reqBody.sku || '',
            stock_quanlity: reqBody.stock_quanlity || 0,
            allow_back_orders: reqBody.allow_back_orders || '',
            low_stock_threshold: reqBody.low_stock_threshold || '',
            stock_status: reqBody.stock_status || "In Stock",

            weight: reqBody.weight
        }


        if (isNaN(price) || isNaN(sale_price)) {
            res.send({ status: false, message: "Sale Price and Price Should be a number" })
            return;
        }

        if (price < 0 || sale_price < 0) {
            res.send({ status: false, message: "Sale Price and Price Should not be a nagetive number" })
            return;
        }

        let productImages = {};
        const productGallary = [];

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

            if (E.fieldname === 'images') {
                productImages = fJson;
            }

            if (E.fieldname === 'gallary_images') {
                productGallary.push(fJson);
            }
        });

        const productVariants = parseJson(variants);
        const productDimentions = parseJson(reqBody.dimensions);
        const productAttributes = parseJson(reqBody.attributes);

        if (productVariants.length) {
            for (let i = 0; i < productVariants.length; i++) {
                const E = productVariants[i];

                if (typeof (E) === 'object') {
                    if (!E.label || !E.value) {
                        return res.send({ status: false, message: 'Variants is invalid' });
                    }
                }
            }
        }

        productJson.variants = productVariants;
        productJson.images = productImages;
        productJson.gallary_images = productGallary;
        productJson.dimensions = productDimentions;
        productJson.attributes = productAttributes;

        const discountedPrice = (price - ((price * sale_price) / 100));
        productJson.discounted_price = discountedPrice.toFixed(2);

        Product.create(productJson).then((data) => {
            var extraction_result = keyword_extractor.extract(title, {
                language: "english",
                remove_digits: true,
                return_changed_case: true,
                remove_duplicates: false
            });
            extraction_result.forEach((item) => {
                KeywordsModel.find({ keywords: item }).then(keyword => {
                    if (keyword.length == 0) {
                        KeywordsModel.create({ keywords: item });
                    }
                })
            })
            res.send({ status: true, data: data._id })
            return;
        }).catch((err) => {
            res.send({ status: false, message: err.message })
            return;
        });

    },

    updateProduct: (req, res, next) => {
        try {
            const reqBody = req.body;
            const reqFiles = req.files;

            if (!reqBody._id) {
                res.send({ status: false, message: "Id is required" });
                return;
            }

            if (reqBody.price || reqBody.sale_price) {
                if (isNaN(reqBody.price) || isNaN(reqBody.sale_price)) {
                    res.send({ status: false, message: "Sale Price and Price Should be a number" })
                    return;
                }
                if (reqBody.price < 0 || reqBody.sale_price < 0) {
                    res.send({ status: false, message: "Sale Price and Price Should not be a nagetive number" })
                    return;
                }
            }

            let productImages = null;
            const proGallary = [];

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
                };

                if (E.fieldname === 'images') {
                    productImages = fJson;
                }

                if (E.fieldname === 'gallary_images') {
                    proGallary.push(fJson);
                }
            });

            if (productImages) {
                reqBody.images = productImages;
            }

            reqBody.$addToSet = {};
            if (proGallary.length) {
                reqBody.$addToSet.gallary_images = proGallary;
            }

            if (reqBody.variants) {
                const productVariants = parseJson(reqBody.variants);
                if (productVariants.length) {
                    for (let i = 0; i < productVariants.length; i++) {
                        const E = productVariants[i];
                        if (!E.label || !E.value) {
                            return res.send({ status: false, message: 'Variants is invalid' });
                        }
                    }
                }

                reqBody.variants = productVariants;
            }

            if (reqBody.dimensions) {
                const productDimentions = parseJson(reqBody.dimensions);
                reqBody.dimensions = productDimentions;
            }

            if (reqBody.attributes) {
                const productAttributes = parseJson(reqBody.attributes);
                reqBody.attributes = productAttributes;
            }

            Product.findOne({ _id: reqBody._id }).then((data) => {

                if (data && data._id) {
                    // for pricing...
                    const Price = (reqBody.price || data.price);
                    const SalePrice = (reqBody.sale_price || data.sale_price);

                    const discountedPrice = (Price - ((Price * SalePrice) / 100));
                    reqBody.discounted_price = discountedPrice.toFixed(2);
                    // console.log(reqBody)
                    Product.update({ _id: reqBody._id }, reqBody).then((data) => {
                        var extraction_result = keyword_extractor.extract(reqBody.title, {
                            language: "english",
                            remove_digits: true,
                            return_changed_case: true,
                            remove_duplicates: false
                        });
                        extraction_result.forEach((item) => {
                            KeywordsModel.find({ keywords: item }).then(keyword => {
                                if (keyword.length == 0) {
                                    KeywordsModel.create({ keywords: item });
                                }
                            })
                        })
                        res.send({ status: true, data })
                        return;
                    }).catch((err) => {
                        res.send({ status: false, message: err.message })
                        return;
                    });
                } else {
                    res.send({ status: false, message: "Product doesn't exist" })
                }
            });
        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    getSearchKeywords: async (req, res, next) => {
        try {
            const reqBody = req.body;
            // console.log(reqBody)

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

            if (req.user && req.user.role === ROLES[1]) {
                MATCH.$and.push({ loginid: req.user._id });
            }

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
                    if (E.name && isValidArr(E.value)) {
                        MATCH.$and.push({ 'variants.label': new RegExp(E.name, 'i'), 'variants.value': new RegExp(E.value, 'i') });
                    }
                });
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

            if (!MATCH.$and.length) delete MATCH.$and;
            if (!MATCH.$or.length) delete MATCH.$or;

            const productList = await Product.aggregate([
                { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" } },
                { $lookup: { from: "sub_categories", localField: "subCategory", foreignField: "_id", as: "subcategory" } },
                { $lookup: { from: "userlogins", localField: "loginid", foreignField: "_id", as: "loginid" } },
                { $lookup: { from: "review_seller_products", localField: "_id", foreignField: "product_id", as: "reviews" } },
                { $unwind: { path: '$loginid', preserveNullAndEmptyArrays: true } },
                { $match: MATCH },
                { $sort: { [sortColumn]: (sortBy === 'asc' ? 1 : -1) } },
                { $skip: skipRecord },
                { $limit: Limit },
                {
                    $project: {
                        "loginid.password": 0,
                        "depot": 0,
                        "description": 0,
                        "specs": 0,
                        "location": 0,
                        "productId": 0,
                        "height": 0,
                        "depth": 0,
                        "width": 0,
                        "allow_back_orders": 0,
                        "low_stock_threshold": 0
                    },
                },
            ]);

            for (let i = 0; i < productList.length; i++) {
                const E = productList[i];
                if (E.reviews.length) {
                    const ratingMap = (E.reviews).map(x => Number(x.rating));
                    const totalRating = ratingMap.reduce((a, b) => a + b, 0);
                    productList[i].avgRating = (totalRating / E.reviews.length);
                } else {
                    productList[i].avgRating = null;
                }
                delete E.reviews;
            }

            productList.forEach(E => {
                // for main image
                if (E.images) {
                    const isArray = Array.isArray(E.images);
                    const isObject = E.images.file;

                    if (isArray) {
                        let arrayToObject = {};
                        E.images.forEach(E2 => {
                            if (E2.file) {
                                arrayToObject = { file: E2.file };
                            } else {
                                arrayToObject = { file: E2 };
                            }
                        })
                        E.images = arrayToObject;
                    }

                    if (isObject) {
                        E.images.file = E.images.file;
                    }

                    if (!isArray && !isObject) {
                        E.images = { file: E.images };
                    }

                    E.thumbnailImage = (E.images && E.images.file) ? 'thumbnail/' + E.images.file : '';

                } else {
                    E.images = {};
                }

                // for slider image
                if (E.gallary_images) {
                    E.gallary_thumbnailImages = [];
                    E.gallary_images.forEach(E2 => {
                        E2.file = E2.file;
                        E.gallary_thumbnailImages.push('thumbnail/' + E2.file);
                    });
                } else {
                    E.gallary_images = [];
                }
            });


            const proCount = await Product.aggregate([
                { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" } },
                { $lookup: { from: "sub_categories", localField: "subCategory", foreignField: "_id", as: "subcategory" } },
                { $lookup: { from: "userlogins", localField: "loginid", foreignField: "_id", as: "loginid" } },
                { $lookup: { from: "review_seller_products", localField: "_id", foreignField: "product_id", as: "reviews" } },
                { $unwind: { path: '$loginid', preserveNullAndEmptyArrays: true } },
                { $match: MATCH }
            ]);

            let FilterDynamic = [];

            let VendorsDynamic = [];
            let ATTRDynamic = [];
            let categoryDynamic = [];
            let subCategoryDynamic = [];
            const PriceDynamic = proCount.map(x => x.price)
            const minPrice = PriceDynamic.reduce((a, b) => Math.min(a, b), 0);
            const maxPrice = PriceDynamic.reduce((a, b) => Math.max(a, b), 0);

            FilterDynamic.push({ minPrice, maxPrice });

            for (let i = 0; i < proCount.length; i++) {
                const E = proCount[i];

                if (E.vendor && !VendorsDynamic.includes(E.vendor)) {
                    VendorsDynamic.push(E.vendor);
                }

                if (E.variants) {
                    (E.variants).forEach(varnt => {
                        const Index = ATTRDynamic.findIndex(x => x.name === varnt.label);
                        if (varnt.label) {
                            if (Index === -1) {
                                ATTRDynamic.push({ name: varnt.label, value: [varnt.value] });
                            } else {
                                if (!ATTRDynamic[Index]['value'].includes(varnt.value)) {
                                    ATTRDynamic[Index]['value'].push(varnt.value);
                                }
                            }
                        }
                    });
                }

                if (E.category) {
                    const catOne = await Category.findById(E.category)
                        .select('_id name slug description')
                        .lean().exec();

                    if (catOne) {
                        const catIndex = categoryDynamic.findIndex(x => x.slug === catOne.slug)
                        if (catIndex === -1) {
                            categoryDynamic.push(catOne);
                        }
                    }
                }

                if (E.subCategory) {
                    const subCat = await Sub_Category.findById(E.subCategory)
                        .select('_id name slug description')
                        .lean().exec();

                    if (subCat) {
                        const subCatIndex = subCategoryDynamic.findIndex(x => x.slug === subCat.slug)
                        if (subCatIndex === -1) {
                            subCategoryDynamic.push(subCat);
                        }
                    }
                }
            }

            const reATTR = [];
            ATTRDynamic.forEach(E => {
                const reValue = [];
                E.value.forEach(E2 => {
                    const reSplite = E2 ? (Array.isArray(E2) ? E2 : E2.split(',')) : [];
                    reSplite.forEach(E3 => {
                        E3 = E3.trim();
                        if (!reValue.includes(E3)) {
                            reValue.push(E3);
                        }
                    })
                })

                const v = {
                    name: E.name,
                    value: reValue
                }
                reATTR.push(v)
            })

            FilterDynamic.push({ vendor: VendorsDynamic });
            FilterDynamic.push({ variants: reATTR });
            FilterDynamic.push({ category: categoryDynamic });
            FilterDynamic.push({ sub_category: subCategoryDynamic });

            return res.send({ status: true, products: productList, filter: FilterDynamic, count: proCount.length });
        } catch (err) {
            console.log(err)
            return res.send({ status: false, message: (err.message || "Something went wrong") });
        }
    },
    getProduct: async (req, res, next) => {

        const { _id } = req.body;

        if (!_id) {
            return res.send({ status: false, message: "Id is required" });
        }

        try {
            // const product = await Product.findById(_id)
            //     .populate('category', '_id name slug')
            //     .populate('loginid', '_id isBussinessVerified email username roles')
            //     .lean().exec();
            const product = await Product.findById(_id)
                .select('-depot -description -specs -location -productId -height -depth -width -allow_back_orders -low_stock_threshold')
                .lean().exec();

            if (!product) {
                return res.send({ status: false, message: "Product not found" });
            }

            if (product.images) {
                const isArray = Array.isArray(product.images);
                const isObject = product.images.file;

                if (isArray) {
                    let arrayToObject = {};
                    product.images.forEach(E2 => {
                        if (E2.file) {
                            arrayToObject = { file: E2.file };
                        } else {
                            arrayToObject = { file: E2 };
                        }
                    })
                    product.images = arrayToObject;
                }

                if (isObject) {
                    product.images.file = product.images.file;
                }

                if (!isArray && !isObject) {
                    product.images = { file: product.images };
                }

                product.thumbnailImage = (product.images && product.images.file) ? 'thumbnail/' + product.images.file : '';

            } else {
                product.images = {};
            }

            // for slider image
            if (product.gallary_images) {
                product.gallary_thumbnailImages = [];
                product.gallary_images.forEach(E2 => {
                    E2.file = E2.file;
                    product.gallary_thumbnailImages.push('thumbnail/' + E2.file);
                });
            } else {
                product.gallary_images = [];
            }

            return res.send({ status: true, data: product, message: "Product get successfully" });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }

    },
    getProductall: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
            const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;
            const searchText = reqBody.searchText ? reqBody.searchText : '';
            const premiumProduct = reqBody.premium_product ? reqBody.premium_product : '';

            let MATCH = {};
            MATCH.$and = [];
            MATCH.$or = [];

            // for customer list
            // if (req.user && req.user.role == ROLES[0]) {
            //     MATCH.$and.push({ loginid: mongoose.Types.ObjectId(req.user._id) });
            // }

            // for seller list
            if (req.user && req.user.roles == ROLES[1]) {
                MATCH.$and.push({ loginid: mongoose.Types.ObjectId(req.user._id) });
            }

            if (searchText & searchText != '') {
                let regex = new RegExp(searchText, 'i');

                MATCH.$or.push({ title: regex });
                MATCH.$or.push({ keyword: regex });
            }

            // false for all true for premium product
            if (premiumProduct) {
                MATCH.$and.push({ is_premium_package: true });
            }

            if (!MATCH.$and.length) delete MATCH.$and;
            if (!MATCH.$or.length) delete MATCH.$or;

            const productList = await Product.aggregate([
                {
                    $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" }
                },
                {
                    $lookup: { from: "sub_categories", localField: "subCategory", foreignField: "_id", as: "subcategory" }
                },
                {
                    $lookup: { from: "userlogins", localField: "loginid", foreignField: "_id", as: "userInfo" }
                },
                {
                    $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true }
                },
                { $match: MATCH },
                {
                    $project: {
                        "loginid.password": 0,
                        "depot": 0,
                        "description": 0,
                        "specs": 0,
                        "location": 0,
                        "productId": 0,
                        "height": 0,
                        "depth": 0,
                        "width": 0,
                        "allow_back_orders": 0,
                        "low_stock_threshold": 0
                    },
                },
                { $sort: { updated_at: -1 } },
                { $skip: (Limit * PageNo) },
                { $limit: Limit }
            ]);

            const countProduct = await Product.aggregate([
                {
                    $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" }
                },
                {
                    $lookup: { from: "sub_categories", localField: "subCategory", foreignField: "_id", as: "subcategory" }
                },
                {
                    $lookup: { from: "userlogins", localField: "loginid", foreignField: "_id", as: "userInfo" }
                },
                {
                    $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true }
                },
                { $match: MATCH }
            ]);


            productList.forEach(E => {

                // for main image
                if (E.images) {
                    const isArray = Array.isArray(E.images);
                    const isObject = E.images.file;

                    if (isArray) {
                        let arrayToObject = {};
                        E.images.forEach(E2 => {
                            if (E2.file) {
                                arrayToObject = { file: E2.file };
                            } else {
                                arrayToObject = { file: E2 };
                            }
                        })
                        E.images = arrayToObject;
                    }

                    if (isObject) {
                        E.images.file = E.images.file;
                    }

                    if (!isArray && !isObject) {
                        E.images = { file: E.images };
                    }

                    E.thumbnailImage = (E.images && E.images.file) ? 'thumbnail/' + E.images.file : '';

                } else {
                    E.images = {};
                }

                // for slider image
                if (E.gallary_images) {
                    E.gallary_thumbnailImages = [];
                    E.gallary_images.forEach(E2 => {
                        E2.file = E2.file;
                        E.gallary_thumbnailImages.push('thumbnail/' + E2.file);
                    });
                } else {
                    E.gallary_images = [];
                }

            });

            return res.send({ status: true, data: productList, count: countProduct.length });
        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },
    getSellerProductall: (req, res, next) => {
        var { limit, page, sort } = req.body;
        var l = limit || 10, p = page || 00; s = (sort == 'asc') ? 1 : -1;
        const { _id } = req.body;
        Product.find({ loginid: _id }).populate('loginid', 'isBussinessVerified email username').limit(l).skip(l * p).sort({ _id: -1 }).then((data) => {
            res.send({ status: true, data })
        });
    },

    deleteProduct: (req, res, next) => {
        const { _id } = req.body;
        Product.deleteOne({ _id: _id }).then((data) => {
            res.send({ status: true, data })
        }).catch(e => {
            res.send({ status: false, message: e.message })
        });
    },

    reviewProduct: async (req, res, next) => {
        try {
            const { product_id, message, rating } = req.body;
            const userId = req.user._id;

            if (!product_id || !rating || !message) {
                return res.send({ status: false, message: 'required parameter missing' });
            }

            const isReview = await Review.findOne({ loginid: userId, product_id: product_id }).lean().exec();

            if (isReview) {
                await Review.findByIdAndUpdate(isReview._id, { message: message, rating: rating });
                return res.send({ status: true, message: 'Review updated successfully' });
            } else {
                const json = {
                    loginid: userId,
                    product_id: product_id,
                    message: message,
                    rating: rating,
                };

                const created = await (new Review(json)).save();
                return res.send({ status: true, data: created._id, message: 'Review created successfully' });
            }

        } catch (e) {
            return res.send({ status: false, message: e.message })
        }
    },

    reviewSeller: async (req, res, next) => {
        try {
            const { seller_id, message, rating } = req.body;
            const userId = req.user._id;

            if (!seller_id || !rating || !message) {
                return res.send({ status: false, message: 'required parameter missing' });
            }

            const isReview = await Review.findOne({ loginid: userId, seller_id: seller_id }).lean().exec();

            if (isReview) {
                await Review.findByIdAndUpdate(isReview._id, { message: message, rating: rating });
                return res.send({ status: true, message: 'Review updated successfully' });
            } else {
                const json = {
                    loginid: userId,
                    seller_id: seller_id,
                    message: message,
                    rating: rating,
                }
                const created = await (new Review(json)).save();
                return res.send({ status: true, data: created._id, message: 'Review created successfully' });
            }

        } catch (e) {
            return res.send({ status: false, message: e.message })
        }

    },

    reviewSellerListing: async (req, res, next) => {
        try {

            const reqBody = req.body;

            if (!reqBody.seller_id) {
                return res.send({ status: false, message: "Seller id is required" });
            }

            let limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
            let pageno = reqBody.page ? parseInt(reqBody.page) : 0;
            let countReviews = await Review.countDocuments({ seller_id: mongoose.Types.ObjectId(reqBody.seller_id) });

            const reviewList = await Review.aggregate([
                { $lookup: { from: "userlogins", localField: "seller_id", foreignField: "_id", as: "sellerInfo" } },
                { $lookup: { from: "userlogins", localField: "loginid", foreignField: "_id", as: "userInfo" } },

                { $unwind: { path: '$sellerInfo' } },
                { $unwind: { path: '$userInfo' } },
                {
                    $project: {
                        "userInfo.password": 0,
                        "sellerInfo.password": 0,
                    },
                },
                { $match: { seller_id: mongoose.Types.ObjectId(reqBody.seller_id) } },
                { $skip: (limit * pageno) },
                { $limit: limit },
                { $sort: { _id: -1 } }
            ]);

            return res.send({ status: true, data: reviewList, count: countReviews });
        } catch (e) {
            res.send({ status: false, message: e.message })
        }

    },
    productReviewListing: async (req, res, next) => {
        try {

            const reqBody = req.body;

            if (!reqBody.product_id) {
                return res.send({ status: false, message: "Product id is required" });
            }

            let limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
            let pageno = reqBody.page ? parseInt(reqBody.page) : 0;

            const reviewList = await Review.aggregate([
                // { $lookup: { from: "products", localField: "product_id", foreignField: "_id", as: "productInfo" } },
                { $lookup: { from: "userlogins", localField: "loginid", foreignField: "_id", as: "userInfo" } },
                // { $unwind: { path: '$productInfo' } },
                { $unwind: { path: '$userInfo' } },
                {
                    $project: {
                        "userInfo.password": 0
                    },
                },
                { $match: { product_id: mongoose.Types.ObjectId(reqBody.product_id) } },
                { $sort: { updated_at: -1 } },
                { $skip: (limit * pageno) },
                { $limit: limit },
            ]);

            const reviewCount = await Review.aggregate([
                { $lookup: { from: "userlogins", localField: "loginid", foreignField: "_id", as: "userInfo" } },
                { $unwind: { path: '$userInfo' } },
                { $match: { product_id: mongoose.Types.ObjectId(reqBody.product_id) } },
            ]);

            return res.send({ status: true, data: reviewList, count: reviewCount.length });
        } catch (e) {
            return res.send({ status: false, message: e.message })
        }
    },
    productByCategory: async (req, res, next) => {
        try {
            let limit = 10;
            const { category_slug } = req.body;
            const page = req.body.page ? req.body.page : 0;
            if (!category_slug) {
                return res.send({ status: false, message: 'category_slug is required' })
            }

            const data = await Product.find({ category: category_slug })
                .select('_id title sale_price variants price vendor discounted_price images category subCategory')
                .skip(page * limit).limit(limit);

            const count = await Product.find({ category: category_slug })
                .select('_id title sale_price variants price vendor discounted_price images category subCategory');

            if (count.length) {

                let Filter = [];

                let Vendors = [];
                let ATTR = [];

                const Price = count.map(x => x.price)
                const minPrice = Price.reduce((a, b) => Math.min(a, b), 0);
                const maxPrice = Price.reduce((a, b) => Math.max(a, b), 0);

                Filter.push({ minPrice, maxPrice });

                let subCategory = await Sub_Category.find({ parent_category: category_slug })
                    .select('_id name slug description')
                    .lean().exec();

                for (let i = 0; i < count.length; i++) {
                    const E = count[i];

                    if (E.vendor && !Vendors.includes(E.vendor)) {
                        Vendors.push(E.vendor)
                    }

                    if (E.variants) {
                        (E.variants).forEach(varnt => {
                            const Index = ATTR.findIndex(x => x.name === varnt.label);
                            if (varnt.label) {
                                if (Index === -1) {
                                    ATTR.push({ name: varnt.label, value: [varnt.value] });
                                } else {
                                    if (!ATTR[Index]['value'].includes(varnt.value)) {
                                        ATTR[Index]['value'].push(varnt.value);
                                    }
                                }
                            }
                        })
                    }


                    if (E.subCategory) {
                        const subCat = await Sub_Category.findById(E.subCategory)
                            .select('_id name slug description')
                            .lean().exec();

                        if (subCat) {
                            const subCatIndex = subCategory.findIndex(x => x.slug === subCat.slug)
                            if (subCatIndex === -1) {
                                subCategory.push(subCat);
                            }
                        }
                    }
                }


                const reATTR = [];
                ATTR.forEach(E => {
                    const reValue = [];
                    E.value.forEach(E2 => {
                        const reSplite = Array.isArray(E2) ? E2 : E2.split(',');
                        reSplite.forEach(E3 => {
                            E3 = E3.trim();
                            if (!reValue.includes(E3)) {
                                reValue.push(E3);
                            }
                        })
                    })

                    const v = {
                        name: E.name,
                        value: reValue
                    }
                    reATTR.push(v)
                })

                Filter.push({ vendor: Vendors });
                Filter.push({ variants: reATTR });

                if (subCategory.length) {
                    Filter.push({ sub_category: subCategory });
                } else {
                    const categoryData = await Category.findById(category_slug).lean().exec();
                    Filter.push({ category: categoryData });
                }

                // Filter.push({ products: count });

                return res.send({ status: true, data, Filter, count: count.length });
            } else {
                res.send({ status: false, message: "no data found!" })
            }
        } catch (e) {
            res.send({ status: false, message: e.message })
        }
    },
    productBySubCategory: async (req, res, next) => {
        try {
            let limit = 10;
            const { subcategory_slug } = req.body;
            const page = req.body.page ? req.body.page : 0;

            if (!subcategory_slug) {
                return res.send({ status: false, message: 'subcategory_slug is required' })
            }

            const data = await Product.find({ subCategory: subcategory_slug })
                // .select('_id title sale_price variants price vendor discounted_price images category subCategory')
                .skip(page * limit).limit(limit).lean().exec();

            const count = await Product.find({ subCategory: subcategory_slug })
                // .select('_id title sale_price variants price vendor discounted_price images category subCategory')
                .lean().exec();

            let subCategory = await Sub_Category.find({ _id: subcategory_slug }).lean().exec();

            if (count.length) {

                let Filter = [];

                let Vendors = [];
                let ATTR = [];
                const Price = count.map(x => x.price)
                const minPrice = Price.reduce((a, b) => Math.min(a, b), 0);
                const maxPrice = Price.reduce((a, b) => Math.max(a, b), 0);

                Filter.push({ minPrice, maxPrice });

                for (let i = 0; i < count.length; i++) {
                    const E = count[i];

                    if (E.vendor && !Vendors.includes(E.vendor)) {
                        Vendors.push(E.vendor)
                    }

                    if (E.variants) {
                        (E.variants).forEach(varnt => {
                            const Index = ATTR.findIndex(x => x.name === varnt.label);
                            if (varnt.label) {
                                if (Index === -1) {
                                    ATTR.push({ name: varnt.label, value: [varnt.value] });
                                } else {
                                    if (!ATTR[Index]['value'].includes(varnt.value)) {
                                        ATTR[Index]['value'].push(varnt.value);
                                    }
                                }
                            }
                        })
                    }
                }

                Filter.push({ vendor: Vendors });

                const reATTR = [];
                ATTR.forEach(E => {
                    const reValue = [];
                    E.value.forEach(E2 => {
                        const reSplite = Array.isArray(E2) ? E2 : E2.split(',');
                        reSplite.forEach(E3 => {
                            E3 = E3.trim();
                            if (!reValue.includes(E3)) {
                                reValue.push(E3);
                            }
                        })
                    })

                    const v = {
                        name: E.name,
                        value: reValue
                    }
                    reATTR.push(v)
                })

                Filter.push({ variants: reATTR });
                Filter.push({ sub_category: subCategory });
                Filter.push({ products: count });

                return res.send({ status: true, data, Filter, count: count.length });

            } else {
                return res.send({ status: false, message: "no data found!" })
            }

        } catch (e) {
            res.send({ status: false, message: e.message })
        }
    },

    productBySubCategory2: async (req, res, next) => {
        try {
            let limit = 5;
            const { subcategory_slug } = req.body;
            const page = req.body.page ? req.body.page : 0;

            if (!subcategory_slug) {
                return res.send({ status: false, message: 'subcategory_slug is required' })
            }

            const data = await Product.find({ subCategory: subcategory_slug })
                // .select('_id title sale_price variants price vendor discounted_price images category subCategory')
                .skip(page * limit).limit(limit).lean().exec();

            const count = await Product.find({ subCategory: subcategory_slug })
                // .select('_id title sale_price variants price vendor discounted_price images category subCategory')
                .lean().exec();

            let subCategory = await Sub_Category.find({ _id: subcategory_slug }).lean().exec();

            if (count.length) {

                let Filter = [];

                let Vendors = [];
                let ATTR = [];
                const Price = count.map(x => x.price)
                const minPrice = Price.reduce((a, b) => Math.min(a, b), 0);
                const maxPrice = Price.reduce((a, b) => Math.max(a, b), 0);

                Filter.push({ minPrice, maxPrice });

                for (let i = 0; i < count.length; i++) {
                    const E = count[i];

                    if (E.vendor && !Vendors.includes(E.vendor)) {
                        Vendors.push(E.vendor)
                    }

                    if (E.variants) {
                        (E.variants).forEach(varnt => {
                            const Index = ATTR.findIndex(x => x.name === varnt.label);
                            if (varnt.label) {
                                if (Index === -1) {
                                    ATTR.push({ name: varnt.label, value: [varnt.value] });
                                } else {
                                    if (!ATTR[Index]['value'].includes(varnt.value)) {
                                        ATTR[Index]['value'].push(varnt.value);
                                    }
                                }
                            }
                        })
                    }
                }

                Filter.push({ vendor: Vendors });

                const reATTR = [];
                ATTR.forEach(E => {
                    const reValue = [];
                    E.value.forEach(E2 => {
                        const reSplite = Array.isArray(E2) ? E2 : E2.split(',');
                        reSplite.forEach(E3 => {
                            E3 = E3.trim();
                            if (!reValue.includes(E3)) {
                                reValue.push(E3);
                            }
                        })
                    })

                    const v = {
                        name: E.name,
                        value: reValue
                    }
                    reATTR.push(v)
                })

                Filter.push({ variants: reATTR });
                Filter.push({ sub_category: subCategory });
                // Filter.push({ products: count });

                return res.send({ status: true, data, Filter, count: count.length });

            } else {
                return res.send({ status: false, message: "no data found!" })
            }

        } catch (e) {
            res.send({ status: false, message: e.message })
        }
    },


    recentlyViewedProducts: async (req, res, next) => {
        try {
            let products = await RecentViewed.aggregate([
                { $match: { loginid: mongoose.Types.ObjectId(req.user._id), status: 0 } },
                { $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' } },
                { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } }
            ]);

            if (products.length > 0) {
                res.send({ status: true, message: 'Record found', products })
            } else {
                res.send({ status: false, message: 'No Record found' })
            }
        } catch (e) {
            res.send({ status: false, message: e.message })
        }
    },
    addProductToRecentViewedProducts: async (req, res, next) => {
        try {
            let body = { loginid: req.user._id, product_id: req.body.product_id }
            let recent = await RecentViewed.findOne(body)
            if (recent) {
                res.send({ status: false, message: 'This product already added!!' })
                return;
            }
            RecentViewed.create(body).then(recent_product => {
                res.send({ status: true, message: 'Record inserted', recent_product })
            }).catch(e => {
                console.log(e)
                res.send({ status: false, message: e.message })
            })
        } catch (e) {
            res.send({ status: false, message: e.message })
        }
    },
    notificationListing: async (req, res, next) => {
        try {

            const reqBody = req.body;
            const Limit = reqBody.limit ? Number(reqBody.limit) : 10;
            const PageNo = reqBody.page ? Number(reqBody.page) : 0;
            var User_id = req.user._id;

            let notification = await Notification.aggregate([
                { $match: { loginid: mongoose.Types.ObjectId(User_id) } },
                { $sort: { updated: -1 } },
                { $skip: PageNo * Limit },
                { $limit: Limit }
            ]);
            const count = await Notification.countDocuments({ loginid: User_id });

            if (notification.length > 0) {
                res.send({ status: true, message: 'Record Get successfully', notification, count });
            } else {
                res.send({ status: false, message: 'not found' })
            }
        } catch (e) {
            res.send({ status: false, message: e.message })
        }
    },

    notificationDetail: async (req, res, next) => {
        try {
            if (!req.body.id) {
                return res.send({ status: false, message: 'Id is required' });
            }

            Notification.findOne({ _id: req.body.id }).then(notification => {
                res.send({ status: true, message: 'Record get successully', data: notification })
            }).catch(e => {
                res.send({ status: false, message: e.message })
            });
        } catch (e) {
            res.send({ status: false, message: e.message })
        }
    },

    markAsRead: async (req, res, next) => {
        try {
            if (!req.body.id) {
                return res.send({ status: false, message: 'Id is required' });
            }

            Notification.findOneAndUpdate({ _id: req.body.id }, { $set: { status: 1 } }).then(notification => {

                if (!notification) {
                    return res.send({ status: false, message: 'Notification not found' });
                }

                res.send({ status: true, message: 'Record updated' })
            }).catch(e => {
                res.send({ status: false, message: e.message })
            });
        } catch (e) {
            res.send({ status: false, message: e.message })
        }
    },
    markAsUnRead: async (req, res, next) => {
        try {
            if (!req.body.id) {
                return res.send({ status: false, message: 'Id is required' });
            }

            Notification.findByIdAndUpdate({ _id: req.body.id }, { $set: { status: 0 } }).then(notification => {

                if (!notification) {
                    return res.send({ status: false, message: 'Notification not found' });
                }

                res.send({ status: true, message: 'Record updated' })
            }).catch(e => {
                res.send({ status: false, message: e.message })
            });
        } catch (e) {
            res.send({ status: false, message: e.message })
        }
    },
    deleteNotification: async (req, res, next) => {
        try {
            if (!req.body.id) {
                return res.send({ status: false, message: 'Id is required' });
            }

            Notification.deleteOne({ _id: req.body.id }).then(notification => {
                res.send({ status: true, message: 'Record deleted' })
            }).catch(e => {
                res.send({ status: false, message: e.message })
            });
        } catch (e) {
            res.send({ status: false, message: e.message })
        }
    },

    addNotification: async (req, res, next) => {
        try {

            let body = { loginid: req.user._id, message: req.body.message, notification_type: req.body.notification_type };
            Notification.create(body).then(notification => {
                res.send({ status: true, message: 'Record Added', notification })
            }).catch(e => {
                res.send({ status: false, message: e.message })
            });
        } catch (e) {
            res.send({ status: false, message: e.message })
        }
    },

    bestSellingItem: async (req, res, next) => {
        try {
            let product = await Order.find({}, { product: 1 })
            let productIds = product.map(obj => { return obj['product'] })
            let ids = []
            for (let i = 0; i < productIds.length; i++) {
                if (productIds[i].length > 0) {
                    for (let j = 0; j < productIds[i].length; j++) {
                        ids.push(productIds[i][j].id)
                    }
                }
            }

            let bestSellingProduct = await Product.find({ _id: { $in: ids } })
            if (bestSellingProduct.length > 0) {
                res.send({ status: true, message: 'Record found!', bestSellingProduct })
            } else {
                res.send({ status: false, message: 'Record not found!' })
            }
        } catch (e) {
            res.send({ status: false, message: e.message })
        }
    },
    productByFilters: async (req, res, next) => {
        try {
            let { limit, page, sort } = req.query;
            let l = parseInt(limit) || 12, p = parseInt(page) || 0, sorting = sort || 0;

            let condition = {}, s = {};
            //Filters by category
            if ((req.query.category)) {
                condition.category = { $in: req.query.category }
            }
            //Filters by price
            if ((req.query.minPrice) || (req.query.maxPrice)) {
                condition.price = { $gte: req.query.minPrice, $lte: req.query.maxPrice }
            }
            if ((req.query.brand)) {
                condition.vendor = { $in: req.query.brand }
            }
            if (sorting == 1) {
                s.created_at = -1;
            }

            let productArray = [Product.find(condition).limit(l).skip(l * p).sort(s)];
            productArray.push(Product.countDocuments(condition))

            let [products, productsCount = null] = await Promise.all(productArray);
            // price shorting hight to low 
            if (sorting == 4) {
                let ascending = products.sort((a, b) => Number(a.price) - Number(b.price));
            } else if (sorting == 5) {
                let descending = products.sort((a, b) => Number(b.price) - Number(a.price));
            }

            if (products.length > 0) {
                res.send({ status: true, data: products, totalcount: productsCount, })
            } else {
                res.send({ status: false, message: 'Record not found!' })
            }
        } catch (e) {
            res.send({ status: false, message: e.message })
        }

    },
    addBulkProduct: async (req, res, next) => {
        try {
            let { products } = req.body;
            if (!products) {
                res.send({ status: false, message: 'Please enter products' })
            }
            Product.insertMany(products).then(data => {
                res.send({ status: true, message: 'Product', data })
            }).catch(err => {
                res.send({ status: false, message: err.message })
            })
        } catch (e) {
            res.send({ status: false, message: e.message })
        }
    },

    getAllProductsExport: (req, res, next) => {

        try {
            let filter = {};
            let queryStr = req.body.queryStr ? req.body.queryStr : {};

            if (req.user && req.user.role === ROLES[1]) {
                filter.loginid = req.user._id;
            }
            
          
            // for Title
            if (queryStr.title) { filter.title = new RegExp(queryStr.title, 'i') }

            // for Featured Product
            if (queryStr.is_featured === true) { filter.is_featured = true } else
                if (queryStr.is_featured === false) { filter.is_featured = false }

            // for Hot Product
            if (queryStr.is_hot === true) { filter.is_hot = true } else
                if (queryStr.is_hot === false) { filter.is_hot = false }

            // for Sale Product
            if (queryStr.is_sale === true) { filter.is_sale = true } else
                if (queryStr.is_sale === false) { filter.is_sale = false }

            // for Active Product
            if (queryStr.is_active === true) { filter.is_active = true } else
                if (queryStr.is_active === false) { filter.is_active = false }

            Product.find(filter).populate('loginid', 'isBussinessVerified email username').then(async (data) => {
                for (let i = 0; i < data.length; i++) {
                    const category = await Category.findById(data[i].category);
                    data[i].category = category ? category.name : '';
                }
const reportInfo = {
    reportName: 'Products',
    arrayData: data,
    fileName: `products-${Date.now()}.xlsx`,
    columns: [
                    { header: 'SKU', key: 'sku', width: 20 },
                    { header: 'Title', key: 'title', width: 15 },
                    { header: 'Price', key: 'price', width: 20 },
                    { header: 'Vendor', key: 'vendor', width: 35 },
                    { header: 'Is Featured', key: 'is_featured', width: 20 },
                    { header: 'Is Hot', key: 'is_hot', width: 20 },
                    { header: 'Is Sale', key: 'is_sale', width: 20 },
                    { header: 'Is Active', key: 'is_active', width: 20 },
                    { header: 'Is Out of Stock', key: 'is_out_of_stock', width: 20 },
                    { header: 'Inventory', key: 'inventory', width: 20 },
                    { header: 'Variants', key: 'variants', width: 20 },
                    { header: 'Product Features', key: 'productFeatures', width: 25 },
                    { header: 'Description', key: 'description', width: 30 },
                    { header: 'Keywords', key: 'keywords', width: 25 },
                    { header: 'Sale Price Date From', key: 'sale_price_date_from', width: 20 },
                    { header: 'Sale Price Date To', key: 'sale_price_date_to', width: 20 },
                    { header: 'Allow Back Orders', key: 'allow_back_orders', width: 20 },
                    { header: 'Low Stock Threshold', key: 'low_stock_threshold', width: 20 },
                    { header: 'Stock Status', key: 'stock_status', width: 20 },
                    { header: 'Weight', key: 'weight', width: 20 },
                    { header: 'Dimensions', key: 'dimensions', width: 20 },
                    { header: 'Sale Price', key: 'sale_price', width: 20 },
    ]
}

const column2 =[
    { header: 'Field Name', key: 'field_name', width: 25, },
    { header: 'Details', key: 'details', width: 100 },
    { header: 'Example', key: 'example', width: 55 },
   
];
const rows2 =[
    { field_name: 'SKU', details: 'Unique Identifier. If you do not enter a SKU well create one for you.', example: 'sku:redmi_note_9_pro_max' },
    { field_name: 'Title', details: 'An alphanumeric string up to 200 characters.', example: 'title:Redmi Note 9 Pro Max' },
    { field_name: 'Price', details: ' Price indicates the price at which product is sold to customers. Please do not use commas or currency signs', example: 'price:17499.99' },
    { field_name: 'Sale Price Date From', details: 'A date in this format: yyyy-mm-dd.', example: 'sale_price_date_from:02/11/2021' },
    { field_name: 'Sale Price Date To', details: 'A date in this format: yyyy-mm-dd.', example: 'sale_price_date_to:02/11/2021' },
    { field_name: 'Sale Price', details: 'The price at which you offer the product for sale.', example: 'sale_price:18000.99' },
    { field_name: 'Weight', details: 'Specify the unit of measure used to describe the weight of the product without shipping material.', example: 'weight:150kg' },
    { field_name: 'Is Out of Stock', details: 'Stock not available for online sales', example: 'is_out_of_stock:false' },
    { field_name: 'Stock Status', details: 'This field is used to check stocks whether available for sale online.', example: 'stock_status:In Stock' },
    { field_name: 'Allow Back Orders', details: 'This field is used to setup back-order and is the date when the back-ordered products will be available for shipping to customers.', example: ' allow_back_orders: test' },
    { field_name: 'Low Stock Threshold', details: 'The minimum  Fixed Stock', example: 'low_stock_threshold: 4' },
    { field_name: 'Dimensions', details: ' Product Dimensions These attributes specify the size and weight of a product', example: "dimensions: { height: '11', width: '10',length: '10'}" },
    { field_name: 'Description', details: "' This beautifully handcrafted dress by newcomer designer Sugar will make you the star of this summer's garden parties. It features a butterfly embroidery on the front, a zip on the back and is made from 100% organic cotton.'", example: "description:Latest mobile in market"},
    { field_name: 'Product Features', details: 'Provide any special features an item has that distinguish it from other, comparable products', example: 'Dishwasher Safe' },
    { field_name: 'Keywords', details: 'Search terms that describe your product: no repetition, no competitor brand names or ASINs.', example: "keywords:[{0:'Shoes'},{1:'Black'},{2:'Sports'}]" },
    { field_name: 'Vendor', details: 'This field is used to vendor details.', example: 'vendor:MI' },
    { field_name: 'Inventory', details: 'This field is used to Inventory details.', example: 'inventory:1' },
    { field_name: 'Variants', details: 'This field is used to Variants details.', example: "variants:[{'label':'color','value':'red,black,blue'}]" },
    { field_name: 'Is Active', details: 'This field is used to determine whether products are active or not.', example: 'is_active:true' },
    { field_name: 'Is Featured', details: 'This field is used to determine whether products are Featured or not.', example: 'is_featured:true' },
    { field_name: 'Is Hot', details: 'This field is used to determine whether products are Hot or not.', example: 'is_hot:true' },
    { field_name: 'Is Sale', details: 'This field is used to determine whether products are Sale or not.', example: 'is_sale:true' },
  
  ];
const Report = await getExcelReport(reportInfo,column2,rows2);

if (Report.status) {
    const downloadUrl = (req.protocol + '://' + req.get('host') + '/' + reportInfo.fileName);
    return res.send({ status: true, data: { fileUrl: downloadUrl }, message: Report.message });
} else {
    return res.send({ status: false, message: Report.message });
}

            }).catch((err) => {
                return res.send({ status: false, message: (err.message || 'Something went wrong, when get product data') });
            });

        } catch (err) {
            return res.send({ status: false, message: (err.message || 'Something went wrong, when get product data') });
        }

    },

    importProducts: (req, res, next) => {
        try {

            if (!req.files || !req.files.length) {
                res.send({ status: false, message: 'File not found' });
                return;
            }

            readXlsxFile(req.files[0].path).then((rows) => {
                const columns = [
                    { title: 'SKU', slug: 'sku' },
                    { title: 'Title', slug: 'title' },
                    { title: 'Price', slug: 'price' },
                    { title: 'Vendor', slug: 'vendor' },

                    { title: 'Is Featured', slug: 'is_featured' },
                    { title: 'Is Hot', slug: 'is_hot' },
                    { title: 'Is Sale', slug: 'is_sale' },
                    { title: 'Is Active', slug: 'is_active' },
                    // { title: 'Discounted Price', slug: 'discounted_price' },
                    { title: 'Is Out Of Stock', slug: 'is_out_of_stock' },
                    // { title: 'Depot', slug: 'depot' },
                    { title: 'Inventory', slug: 'inventory' },
                    { title: 'Variants', slug: 'variants' },
                    { title: 'Product Features', slug: 'productFeatures' },
                    // { title: 'Category', slug: 'category' },
                    { title: 'Description', slug: 'description' },
                    // { title: 'Specs', slug: 'specs' },
                    // { title: 'Color', slug: 'color' },
                    // { title: 'Location', slug: 'location' },
                    { title: 'Keywords', slug: 'keywords' },
                    // { title: 'Reward Point', slug: 'rewardpoint' },
                    // { title: 'Product Id', slug: 'productId' },

                    // { title: 'Stock Quantity', slug: 'stock_quantity' },
                    { title: 'Sale Price Date From', slug: 'sale_price_date_from' },
                    { title: 'Sale Price Date To', slug: 'sale_price_date_to' },
                    { title: 'Allow Back Orders', slug: 'allow_back_orders' },
                    { title: 'Low Stock Threshold', slug: 'low_stock_threshold' },
                    { title: 'Stock Status', slug: 'stock_status' },
                    { title: 'Weight', slug: 'weight' },
                    { title: 'Dimensions', slug: 'dimensions' },
                    { title: 'Attributes', slug: 'attributes' },
                    { title: 'Sale Price', slug: 'sale_price' },
                    // { title: 'Sub Category', slug: 'subCategory' }
                ];

                // condition for columns
                for (let a = 0; a < rows[0].length; a++) {
                    const E = rows[0][a];
                    if (columns[a] && ((E.toUpperCase()) !== ((columns[a].title).toUpperCase()))) {
                        return res.send({ status: false, message: "Columns are not arrange or define properly" });
                    }
                }

                const productArray = [];

                for (let j = 0; j < rows.length; j++) {
                    const json = {};
                    json['loginid'] = (req.user._id);
                    for (let k = 0; k < rows[j].length; k++) {
                        if (j && columns[k]) {
                            json[columns[k].slug] = rows[j][k];
                        }
                    }

                    if (!j) { continue; }

                    if (!json.sku)
                        return requiredField(res, 'SKU');

                    if (!json.title)
                        return requiredField(res, 'Title', json.sku);

                    if (!json.vendor)
                        return requiredField(res, 'Vendor', json.sku);

                    if (!json.price)
                        return requiredField(res, 'Price', json.sku);

                    if (!json.sale_price)
                        return requiredField(res, 'Sale Price', json.sku);

                    // if (!json.stock_quantity)
                    //     return requiredField(res, 'Stock Quantity', json.sku);

                    // const category = mongoose.Types.ObjectId.isValid(json.category);
                    // category ? json.category = json.category : delete json.category;

                    // const subCategory = mongoose.Types.ObjectId.isValid(json.subCategory);
                    // subCategory ? json.subCategory = json.subCategory : delete json.subCategory;

                    const variants = parseJson(json.variants);
                    json.variants = variants ? variants : [];

                    // const location = parseJson(json.location);
                    // json.location = location ? location : [];

                    // const color = parseJson(json.color);
                    // json.color = color ? color : [];

                    const keywords = parseJson(json.keywords);
                    json.keywords = keywords ? keywords : [];

                    const productFeatures = parseJson(json.productFeatures);
                    json.productFeatures = productFeatures ? productFeatures : [];

                    const Dimensions = parseJson(json.dimensions);
                    json.dimensions = Dimensions ? Dimensions : null;

                    const Attributes = parseJson(json.attributes);
                    json.attributes = Attributes ? Attributes : [];

                    Object.keys(json).forEach(key => {
                        if (json[key] == 'null') {
                            json[key] = null;
                        }
                    })

                    productArray.push(json)
                }

                Product.insertMany(productArray).then(function () {
                    return res.send({ status: true, message: 'Xlsx file import successfully' })
                }).catch(function (error) {
                    return res.send({ status: false, message: error.message });
                });
            }).catch(function (error) {
                return res.send({ status: false, message: error.message });
            });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }

    },

    searchProducts: async (req, res, next) => {
        try {
            if (req.body.filter) {
                const reqBody = req.body;
                let filter = new RegExp(reqBody.filter, 'i');

                const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
                const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;

                const MATCH = {};
                MATCH.$or = [];
                MATCH.$and = [];

                MATCH.$or.push({ keywords: filter });
                MATCH.$or.push({ title: filter });
                MATCH.$or.push({ 'category.name': filter });
                MATCH.$or.push({ 'subcategory.name': filter });
                MATCH.$or.push({ 'variants.value': filter });
                MATCH.$or.push({ 'variants.label': filter });
                MATCH.$or.push({ vendor: filter });
                MATCH.$or.push({ sku: filter });
                MATCH.$or.push({ weight: filter });


                if (!MATCH.$and.length) delete MATCH.$and;
                if (!MATCH.$or.length) delete MATCH.$or;

                const productList = await Product.aggregate([
                    { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" } },
                    { $lookup: { from: "sub_categories", localField: "category._id", foreignField: "parent_category", as: "subcategory" } },
                    { $lookup: { from: "userlogins", localField: "loginid", foreignField: "_id", as: "loginid" } },
                    { $unwind: { path: '$loginid', preserveNullAndEmptyArrays: true } },
                    { $match: MATCH },
                    {
                        $project: {
                            "loginid.password": 0,
                            "depot": 0,
                            "description": 0,
                            "specs": 0,
                            "location": 0,
                            "productId": 0,
                            "height": 0,
                            "depth": 0,
                            "width": 0,
                            "allow_back_orders": 0,
                            "low_stock_threshold": 0
                        },
                    },
                    { $sort: { updated_at: -1 } },
                    { $skip: PageNo * Limit },
                    { $limit: Limit }
                ]);

                // add base url on images
                productList.forEach(E => {

                    // for main image
                    if (E.images) {
                        const isArray = Array.isArray(E.images);
                        const isObject = E.images.file;

                        if (isArray) {
                            let arrayToObject = {};
                            E.images.forEach(E2 => {
                                if (E2.file) {
                                    arrayToObject = { file: E2.file };
                                } else {
                                    arrayToObject = { file: E2 };
                                }
                            });
                            E.images = arrayToObject;
                        }

                        if (isObject) {
                            E.images.file = E.images.file;
                        }

                        if (!isArray && !isObject) {
                            E.images = { file: E.images };
                        }

                    } else {
                        E.images = {};
                    }

                    // for slider image
                    if (E.gallary_images) {
                        E.gallary_images.forEach(E2 => {
                            E2.file = E2.file;
                        });
                    } else {
                        E.gallary_images = [];
                    }

                });

                const productCount = await Product.aggregate([
                    { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" } },
                    { $lookup: { from: "userlogins", localField: "loginid", foreignField: "_id", as: "loginid" } },
                    { $unwind: { path: '$loginid', preserveNullAndEmptyArrays: true } },
                    { $match: MATCH },
                ]);


                let FilterDynamic = [];

                let VendorsDynamic = [];
                let ATTRDynamic = [];
                let categoryDynamic = [];
                let subCategoryDynamic = [];
                const PriceDynamic = productCount.map(x => x.price)
                const minPrice = PriceDynamic.reduce((a, b) => Math.min(a, b), 0);
                const maxPrice = PriceDynamic.reduce((a, b) => Math.max(a, b), 0);

                FilterDynamic.push({ minPrice, maxPrice });

                for (let i = 0; i < productCount.length; i++) {
                    const E = productCount[i];

                    if (E.vendor && !VendorsDynamic.includes(E.vendor)) {
                        VendorsDynamic.push(E.vendor);
                    }

                    if (E.variants) {
                        (E.variants).forEach(varnt => {
                            const Index = ATTRDynamic.findIndex(x => x.name === varnt.label);
                            if (varnt.label) {
                                if (Index === -1) {
                                    ATTRDynamic.push({ name: varnt.label, value: [varnt.value] });
                                } else {
                                    if (!ATTRDynamic[Index]['value'].includes(varnt.value)) {
                                        ATTRDynamic[Index]['value'].push(varnt.value);
                                    }
                                }
                            }
                        })
                    }

                    if (E.category) {
                        const catOne = await Category.findById(E.category)
                            .select('_id name slug description')
                            .lean().exec();

                        if (catOne) {
                            const catIndex = categoryDynamic.findIndex(x => x.slug === catOne.slug)
                            if (catIndex === -1) {
                                categoryDynamic.push(catOne);
                            }
                        }
                    }

                    if (E.subCategory) {
                        const subCat = await Sub_Category.findById(E.subCategory)
                            .select('_id name slug description')
                            .lean().exec();

                        if (subCat) {
                            const subCatIndex = subCategoryDynamic.findIndex(x => x.slug === subCat.slug)
                            if (subCatIndex === -1) {
                                subCategoryDynamic.push(subCat);
                            }
                        }
                    }
                }

                FilterDynamic.push({ vendor: VendorsDynamic });


                const reATTR = [];
                ATTRDynamic.forEach(E => {
                    const reValue = [];
                    E.value.forEach(E2 => {
                        const reSplite = Array.isArray(E2) ? E2 : E2.split(',');
                        reSplite.forEach(E3 => {
                            E3 = E3.trim();
                            if (!reValue.includes(E3)) {
                                reValue.push(E3);
                            }
                        })
                    })

                    const v = {
                        name: E.name,
                        value: reValue
                    }
                    reATTR.push(v)
                })

                FilterDynamic.push({ variants: reATTR });
                FilterDynamic.push({ category: categoryDynamic });
                FilterDynamic.push({ sub_category: subCategoryDynamic });

                return res.send({ status: true, products: productList, filter: FilterDynamic, count: productCount.length })
            } else {
                return res.send({ status: false, message: "Null Param" });
            }

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    searchProductsNameByKeyWord: async (req, res, next) => {
        try {
            if (req.body.filter) {
                const reqBody = req.body;
                let filter = new RegExp(reqBody.filter, 'i');

                const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
                const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;

                const MATCH = {};
                MATCH.$or = [];
                MATCH.$and = [];

                MATCH.$or.push({ title: filter });

                if (!MATCH.$and.length) delete MATCH.$and;
                if (!MATCH.$or.length) delete MATCH.$or;

                const productList = await Product.aggregate([
                    { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" } },
                    { $lookup: { from: "sub_categories", localField: "category._id", foreignField: "parent_category", as: "subcategory" } },
                    { $lookup: { from: "userlogins", localField: "loginid", foreignField: "_id", as: "loginid" } },
                    { $unwind: { path: '$loginid', preserveNullAndEmptyArrays: true } },
                    { $match: MATCH },
                    {
                        $project: {
                            title: 1
                        },
                    },
                    { $sort: { updated_at: -1 } },
                    { $skip: PageNo * Limit },
                    { $limit: Limit }
                ]);

                const productCount = await Product.aggregate([
                    { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" } },
                    { $lookup: { from: "sub_categories", localField: "category._id", foreignField: "parent_category", as: "subcategory" } },
                    { $lookup: { from: "userlogins", localField: "loginid", foreignField: "_id", as: "loginid" } },
                    { $unwind: { path: '$loginid', preserveNullAndEmptyArrays: true } },
                    { $match: MATCH }
                ]);

                return res.send({ status: true, products: productList, count: productCount.length })
            } else {
                return res.send({ status: false, message: "Null Param" });
            }

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    updatePremiumPackge: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const ProductId = reqBody.product_id;

            if (!ProductId) {
                return res.send({ status: false, message: 'Product  id is required' });
            }

            const json = {
                is_premium_package: (reqBody.is_premium_package) ? true : false,
                premium_package_desc: reqBody.premium_package_desc
            }

            const updated = await Product.findByIdAndUpdate(ProductId, json);

            if (!updated) {
                return res.send({ status: false, message: `Product not found for Product Id ${ProductId}` });
            }

            return res.send({ status: true, message: `Updated successsfully` });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    createGetComapareProduct: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const ProductIds = reqBody.product_ids;

            reqBody.loginid = req.user._id;

            if (!isValidArr(ProductIds)) {
                return res.send({ status: false, message: 'Product ids is required' });
            }

            const created = await (new Compare_product(reqBody)).save();

            const products = await Product.find({ _id: { $in: ProductIds } });

            return res.send({ status: true, data: products, message: `Get Product Info successsfully` });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    trandingProductHighlight: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
            const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;
            let product = await Order.find({}, { product: 1 })
            let productIds = product.map(obj => { return obj['product'] })
            let ids = [];
            const count = {};
            const productArray = [];
            const tranddingProduct = [];
            for (let i = 0; i < productIds.length; i++) {
                if (productIds[i].length > 0) {
                    for (let j = 0; j < productIds[i].length; j++) {
                        ids.push(productIds[i][j].id)
                    }
                }
            }
            for (let i = 0; i < ids.length; i++) {
                const val = ids[i];
                if (val in count) {
                    count[val] = count[val] + 1;
                } else {
                    count[val] = 1;
                }
            }
            for (a in count) {
                let data = { id: a, countIDs: count[a] }
                productArray.push(data)
            }
            let bestSellingProduct = await Product.find({ _id: { $in: ids } }).sort({ updated_at: -1 }).limit(Limit).skip(Limit * PageNo);
            const result = bestSellingProduct.map(item => {
                const obj = productArray.find(o => o.id === item.id);
                return { ...item, ...obj };
            });
            result.sort(function (a, b) { return b.countIDs - a.countIDs });
            for (a in result) { tranddingProduct.push(result[a]._doc); }
            if (tranddingProduct.length > 0) {
                res.send({ status: true, message: 'Record found!', tranddingProduct })
            } else {
                res.send({ status: false, message: 'Record not found!' })
            }
        } catch (e) {
            res.send({ status: false, message: e.message });
        }
    },

    relatedProducts: async (req, res, next) => {
        try {
            const productId = req.body.product_id;
            if (!productId) {
                return res.send({ status: false, message: 'Product Id is required' });
            }

            const isProduct = await Product.findById(productId);

            if (!isProduct.category && !isProduct.subCategory) {
                return res.send({ status: false, message: 'Related Product not found' });
            }

            const MATCH = {};
            MATCH.$or = [];
            MATCH.$and = [];

            if (isProduct.category) {
                MATCH.$or.push({ category: isProduct.category });
            }

            if (isProduct.subCategory) {
                MATCH.$or.push({ subCategory: isProduct.subCategory });
            }

            MATCH.$and.push({ _id: { $ne: productId } });

            const categoryWise = await Product.find(MATCH)
                .select('-depot -description -specs -location -productId -height -depth -width -allow_back_orders -low_stock_threshold')
                .lean().exec();

            return res.send({ status: true, data: categoryWise });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },


    createProductQuesAns: async (req, res, next) => {
        try {
            const reqBody = req.body;

            const quesAnsModel = new productQuesAns(reqBody);

            const created = await quesAnsModel.save();
            return res.send({ status: true, data: created._id, message: 'Created successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    updateProductQuesAns: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const questionId = reqBody._id;

            if (!questionId) {
                return res.send({ status: false, message: 'Question id is required' });
            }

            const isQues = await productQuesAns.findByIdAndUpdate(questionId, reqBody).lean().exec();

            if (!isQues) {
                return res.send({ status: false, message: 'Question Not found for this id' });
            }

            return res.send({ status: true, message: 'Updated successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    getProductQuesAnsByQuesId: async (req, res, next) => {
        try {
            const reqQuery = req.query;
            const Id = reqQuery.ques_id;

            if (!Id) {
                return res.send({ status: false, message: 'Question Id is required' });
            }

            const ques = await productQuesAns.findById(Id).lean().exec();

            if (!ques) {
                return res.send({ status: false, message: 'Question not found for this id' });
            }

            let sellerInfo = {};

            const userInfo = await UserLogins.findById(ques.user_id).select('-password').lean().exec();
            const productInfo = await Product.findById(ques.product_id).lean().exec();

            if (productInfo) {
                sellerInfo = await UserLogins.findById(productInfo.loginid).select('-password').lean().exec();
            }

            ques.userInfo = userInfo;
            ques.productInfo = productInfo;
            ques.sellerInfo = sellerInfo;

            return res.send({ status: true, data: ques, message: 'Get successfully' });
        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    getProductQuesAnsByProductId: async (req, res, next) => {
        try {
            const reqQuery = req.query;
            const Id = reqQuery.product_id;

            if (!Id) {
                return res.send({ status: false, message: 'Id is required' });
            }

            const isProduct = await Product.findById(Id).lean().exec();

            if (!isProduct) {
                return res.send({ status: false, message: 'Product Not Found' });
            }

            const isQuesAns = await productQuesAns.aggregate([
                { $lookup: { from: "products", localField: "product_id", foreignField: "_id", as: "productInfo" } },
                { $lookup: { from: "userlogins", localField: "productInfo.loginid", foreignField: "_id", as: "sellerInfo" } },
                { $lookup: { from: "userlogins", localField: "user_id", foreignField: "_id", as: "userInfo" } },
                { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$sellerInfo', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
                { $match: { product_id: mongoose.Types.ObjectId(Id) } },
                {
                    $project: {
                        productInfo: 0,
                        'sellerInfo.password': 0,
                        'userInfo.password': 0
                    }
                }
            ]);

            isProduct.quesAns = isQuesAns;

            return res.send({ status: true, data: isProduct, message: 'Get successfully' });
        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    deleteProductQuesAns: async (req, res, next) => {
        try {
            const reqQuery = req.query;
            const Id = reqQuery.ques_id;

            if (!Id) {
                return res.send({ status: false, message: 'Id is required' });
            }

            const deleted = await productQuesAns.findByIdAndDelete(Id).lean().exec();

            if (!deleted) {
                return res.send({ status: false, message: 'Question not found' });
            }

            return res.send({ status: true, message: 'Deleted successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    topSaleProductCategoryWiseList: async (req, res, next) => {
        try {
            const proList = await Product.aggregate([
                { $match: { subCategory: { $ne: null } } },
                {
                    $group: {
                        _id: "$subCategory",
                        productInfo: {
                            $push: "$$ROOT"
                        },
                        count: { $sum: 1 }
                    },
                }
            ]);

            for (let i = 0; i < proList.length; i++) {
                const E = proList[i];
                console.log(E._id)
                const cat = await Sub_Category.findById(E._id).select('_id name slug description').lean().exec();

                if (!cat) {
                    continue;
                }

                E.category = cat;
                const h = E.productInfo.sort((a, b) => b.top_sale - a.top_sale);
                E.category.products = h;
                delete E._id;
                delete E.productInfo;
            }

            return res.send({ status: true, data: proList });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    topSaleProductByCategory: async (req, res, next) => {
        try {
            const categoryId = req.body.category_id;

            if (!categoryId) {
                return res.send({ status: false, message: 'Category Id is required' });
            }

            const proList = await Product.aggregate([
                { $match: { subCategory: mongoose.Types.ObjectId(categoryId) } },
                {
                    $group: {
                        _id: "$subCategory",
                        productInfo: {
                            $push: "$$ROOT"
                        },
                        count: { $sum: 1 }
                    }
                }
            ]);

            for (let i = 0; i < proList.length; i++) {
                const E = proList[i];
                console.log(E._id)
                const cat = await Sub_Category.findById(E._id).select('_id name slug description').lean().exec();

                if (!cat) {
                    continue;
                }

                E.category = cat;
                const h = E.productInfo.sort((a, b) => b.top_sale - a.top_sale);
                E.category.products = h;
                delete E._id;
                delete E.productInfo;
            }

            return res.send({ status: true, data: proList });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

}

function parseJson(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return str;
    }
}

function requiredField(res, column, sku) {
    if (sku) {
        return res.send({ status: false, message: `${column} is required for SKU ${sku}` });
    } else {
        return res.send({ status: false, message: `${column} is required for insert products` });
    }
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

function getExcelReport(reportInfo,column2,rows2) {
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
        worksheet.addRows([]);
        let worksheet1 = workbook.addWorksheet("Data Definition");

        //  WorkSheet Header
        worksheet1.columns = column2;

        // Add Array Rows
        worksheet1.addRows(rows2);

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







// {
//     "page": 0,
//     "limit": 1000,
//     "sortColumn": "price",
//     "sortBy": "desc",
//     "filter": "",
//     "category": "",
//     "sub_category": "",
//     "queryStr": {
//         "title": "",
//         "is_featured": "",
//         "is_hot": "",
//         "is_sale": "",
//         "is_active": "",
//         "is_premium_package": "",
//         "price": [ 0, 1000000 ],
//         "discount": [ 0, 100 ],
//         "vendor": [],
//         "variants": [
//             {
//                 "name": "color",
//                 "value": ["red"]
//             },
//             {
//                 "name": "size",
//                 "value": ["small", "medium"]
//             }
//         ]
//     }
// }




// http://api.galinukkad.com/admin-products-report








