const { Shipping_Codes } = require('../_helper/db');

module.exports = {
    createShippingCodes: async (req, res, next) => {
        try {
            const reqBody = req.body;
            let created = '';

            if (Array.isArray(reqBody)) {
                created = await Shipping_Codes.insertMany(reqBody);
            } else {
                const shippingModel = new Shipping_Codes(reqBody);
                created = await shippingModel.save();
            }

            return res.send({ status: true, data: created, message: 'Shipping Codes created successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    updateShippingCodes: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const Id = reqBody._id;

            if (!Id) {
                return res.send({ status: false, message: 'Id is required' });
            }

            const shipping = await Shipping_Codes.findByIdAndUpdate(Id, reqBody).lean().exec();

            if (!shipping) {
                return res.send({ status: true, message: 'shipping data not found for this id' });
            }

            return res.send({ status: true, message: 'Info updated successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    getOneShippingCodes: async (req, res, next) => {
        try {
            const reqQuery = req.query;
            const Id = reqQuery._id;

            if (!Id) {
                return res.send({ status: false, message: 'Id is required' });
            }

            const shipping = await Shipping_Codes.findById(Id).lean().exec();

            if (!shipping) {
                return res.send({ status: false, message: 'shipping Codes not found for this id' });
            }

            return res.send({ status: true, data: shipping, message: 'Shipping Codes get successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    getAllShippingCodes: async (req, res, next) => {
        try {

            const reqBody = req.body;
            const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
            const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;

            const AllShipping = await Shipping_Codes.find().skip(Limit * PageNo).limit(Limit).lean().exec();
            const count = await Shipping_Codes.count();

            return res.send({ status: true, data: AllShipping, count: count, message: 'All Shipping code get successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    deleteShippingCodes: async (req, res, next) => {
        try {
            const reqQuery = req.query;
            const Id = reqQuery._id;

            if (!Id) {
                return res.send({ status: false, message: 'Id is required' });
            }

            const deleted = await Shipping_Codes.findByIdAndDelete(Id).lean().exec();

            if (!deleted) {
                return res.send({ status: false, message: 'shipping code not found' });
            }

            return res.send({ status: true, message: 'shipping code deleted successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    getShippingCodesByPincodeNo: async (req, res, next) => {
        try {
            const reqQuery = req.query;
            const pinCode = reqQuery.pincode;

            if (!pinCode) {
                return res.send({ status: false, message: 'pincode is required' });
            }

            const shipping = await Shipping_Codes.find({ pincode: pinCode }).lean().exec();

            return res.send({ status: true, data: shipping, message: 'Shipping code get successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

}
