const { Ecom_Annexure } = require('../_helper/db');

module.exports = {
    createRates: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const shippingModel = new Ecom_Annexure(reqBody);

            const created = await shippingModel.save();
            return res.send({ status: true, data: created._id, message: 'Shipping rates created successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    updateRates: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const Id = reqBody._id;

            if (!Id) {
                return res.send({ status: false, message: 'Id is required' });
            }

            const shipping = await Ecom_Annexure.findByIdAndUpdate(Id, reqBody).lean().exec();

            if (!shipping) {
                return res.send({ status: true, message: 'shipping data not found for this id' });
            }

            return res.send({ status: true, message: 'Info updated successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    getOneRates: async (req, res, next) => {
        try {
            const reqQuery = req.query;
            const Id = reqQuery._id;

            if (!Id) {
                return res.send({ status: false, message: 'Id is required' });
            }

            const shipping = await Ecom_Annexure.findById(Id).lean().exec();

            if (!shipping) {
                return res.send({ status: false, message: 'shipping rate not fount for this id' });
            }

            return res.send({ status: true, data: shipping, message: 'Shipping rate get successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    getAllRates: async (req, res, next) => {
        try {

            const reqBody = req.body;
            const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
            const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;

            const AllShipping = await Ecom_Annexure.find().skip(Limit * PageNo).limit(Limit).lean().exec();
            const count = await Ecom_Annexure.count();

            return res.send({ status: true, data: AllShipping, count: count, message: 'All Shipping rate get successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    deleteRates: async (req, res, next) => {
        try {
            const reqQuery = req.query;
            const Id = reqQuery._id;

            if (!Id) {
                return res.send({ status: false, message: 'Id is required' });
            }

            const deleted = await Ecom_Annexure.findByIdAndDelete(Id).lean().exec();

            if (!deleted) {
                return res.send({ status: false, message: 'shipping rate not found' });
            }

            return res.send({ status: true, message: 'shipping rate deleted successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

}
