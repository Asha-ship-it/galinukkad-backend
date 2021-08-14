const { Shipping_Rates } = require('../_helper/db');

module.exports = {
    createShippingRates: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const shippingModel = new Shipping_Rates(reqBody);

            const created = await shippingModel.save();
            return res.send({ status: true, data: created._id, message: 'Shipping rates created successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    updateShippingRates: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const Id = reqBody._id;

            if (!Id) {
                return res.send({ status: false, message: 'Id is required' });
            }

            const shipping = await Shipping_Rates.findByIdAndUpdate(Id, reqBody).lean().exec();

            if (!shipping) {
                return res.send({ status: true, message: 'shipping data not found for this id' });
            }

            return res.send({ status: true, message: 'Info updated successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    getOneShippingRates: async (req, res, next) => {
        try {
            const reqQuery = req.query;
            const Id = reqQuery._id;

            if (!Id) {
                return res.send({ status: false, message: 'Id is required' });
            }

            const shipping = await Shipping_Rates.findById(Id).lean().exec();

            if (!shipping) {
                return res.send({ status: false, message: 'shipping rate not fount for this id' });
            }

            return res.send({ status: true, data: shipping, message: 'Shipping rate get successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    getAllShippingRates: async (req, res, next) => {
        try {

            const reqBody = req.body;
            const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
            const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;

            const AllShipping = await Shipping_Rates.find().skip(Limit * PageNo).limit(Limit).lean().exec();
            const count = await Shipping_Rates.count();

            return res.send({ status: true, data: AllShipping, count: count, message: 'All Shipping rate get successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    deleteShippingRates: async (req, res, next) => {
        try {
            const reqQuery = req.query;
            const Id = reqQuery._id;

            if (!Id) {
                return res.send({ status: false, message: 'Id is required' });
            }

            const deleted = await Shipping_Rates.findByIdAndDelete(Id).lean().exec();

            if (!deleted) {
                return res.send({ status: false, message: 'shipping rate not found' });
            }

            return res.send({ status: true, message: 'shipping rate deleted successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    getShippingRatesByPincodeNo: async (req, res, next) => {
        try {
            const reqQuery = req.query;
            const pinCode = reqQuery.pincode;

            if (!pinCode) {
                return res.send({ status: false, message: 'pincode is required' });
            }

            const shipping = await Shipping_Rates.find({ pincode: pinCode }).lean().exec();

            return res.send({ status: true, data: shipping, message: 'Shipping rate get successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

}