const { CouponCodes, Product } = require('../_helper/db');
const moment = require('moment');

module.exports = {
    createCouponCodes: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const couponModel = new CouponCodes(reqBody);

            const created = await couponModel.save();

            return res.send({ status: true, data: created._id, message: "Coupon Code Created Successfully" });

        } catch (error) {
            return res.send({ status: false, message: (error.message || "Something went wrong, when create coupon code") });
        }
    },

    updateCouponCodes: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const _id = reqBody._id;

            if (!_id) { return res.send({ status: false, message: "Id is required" }) }

            const updated = await CouponCodes.findByIdAndUpdate(_id, reqBody);

            if (!updated) {
                return res.send({ status: false, message: `Coupon Code not found` })
            }

            return res.send({ status: true, data: updated._id, message: "Coupon Code Updated Successfully" });

        } catch (error) {
            return res.send({ status: false, message: (error.message || "Something went wrong, when update coupon code") });
        }
    },

    getCouponCodes: async (req, res, next) => {
        try {
            const reqQuery = req.query;
            const _id = reqQuery._id;

            if (!_id) { return res.send({ status: false, message: "Id is required" }) }

            const getCoupon = await CouponCodes.findById(_id).lean().exec();

            if (!getCoupon) {
                return res.send({ status: false, message: `Coupon Code not found` })
            }

            return res.send({ status: true, data: getCoupon, message: "Coupon Code get Successfully" });

        } catch (error) {
            return res.send({ status: false, message: (error.message || "Something went wrong, get coupon code") });
        }
    },

    getAllCouponCodes: async (req, res, next) => {
        try {

            const reqBody = req.body;
            const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
            const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;

            const getAllCoupons = await CouponCodes.find().sort({ updated_at: -1 }).skip(Limit * PageNo).limit(Limit).lean().exec();
            const count = await CouponCodes.count();

            return res.send({ status: true, data: getAllCoupons, count: count, message: "All Coupon Codes get Successfully" });

        } catch (error) {
            return res.send({ status: false, message: (error.message || "Something went wrong, when get coupon code") });
        }
    },

    deleteCouponCodes: async (req, res, next) => {
        try {
            const reqQuery = req.query;
            const _id = reqQuery._id;

            if (!_id) { return res.send({ status: false, message: "Id is required" }) }

            const isCoupon = await CouponCodes.findByIdAndDelete(_id).lean().exec();

            if (!isCoupon) {
                return res.send({ status: false, message: `Coupon Code not found` })
            }

            return res.send({ status: true, message: "Coupon Code deleted Successfully" });

        } catch (error) {
            return res.send({ status: false, message: (error.message || "Something went wrong, when delete coupon code") });
        }
    },

    applyCouponCode: async (req, res, next) => {
        try {
            const reqQuery = req.query;
            const code = reqQuery.code;
            const productId = reqQuery.product_id;

            if (!code) { return res.send({ status: false, message: "code is required" }) }
            if (!productId) { return res.send({ status: false, message: "Product Id is required" }) }

            const getCoupon = await CouponCodes.findOne({ code: code }).lean().exec();
            const getProduct = await Product.findById(productId).lean().exec();

            if (!getCoupon) {
                return res.send({ status: false, message: `Coupon Code not found` });
            }

            if (!getProduct) {
                return res.send({ status: false, message: `Product not found` });
            }

            if (new Date(getCoupon.expireDate).getTime() <= Date.now()) {
                return res.send({ status: false, message: `Coupon Code is expired` });
            }

            let price = 0;

            if (getCoupon.isPercent) {
                price = getProduct.price - (getProduct.price * getCoupon.amount / 100);
            } else {
                price = getProduct.price - getCoupon.amount;
            }

            return res.send({ status: true, data: price, message: "Updated Price get Successfully" });

        } catch (error) {
            return res.send({ status: false, message: (error.message || "Something went wrong, get coupon code") });
        }
    }

}
