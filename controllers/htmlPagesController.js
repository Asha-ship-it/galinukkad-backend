const { page } = require('pdfkit');
const { HtmlPages } = require('../_helper/db');

module.exports = {
    createHtmlPages: async (req, res, next) => {
        try {
            const reqBody = req.body;
            reqBody.loginid = req.user._id;
            
            let title = req.body.title;
            title = title.toLowerCase();
            reqBody.slug = title.replace(" ", "_");
            const pageModel = new HtmlPages(reqBody);

            const created = await pageModel.save();
            return res.send({ status: true, data: created._id, message: 'Page created successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    updateHtmlPages: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const Id = reqBody._id;

            if (!Id) {
                return res.send({ status: false, message: 'Id is required' });
            }
            let title = req.body.title;
            title = title.toLowerCase();
            reqBody.slug = title.replace(" ", "_");
            await HtmlPages.findByIdAndUpdate(Id, reqBody).lean().exec();

            return res.send({ status: true, message: 'Page updated successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    getHtmlPages: async (req, res, next) => {
        try {
            const reqQuery = req.query;
            const slug = reqQuery.slug;

            if (!slug) {
                return res.send({ status: false, message: 'slug is required' });
            }

            const Page = await HtmlPages.find({slug: slug}).lean().exec();

            if (!Page) {
                return res.send({ status: false, message: 'Page not fount for this slug' });
            }

            return res.send({ status: true, data: Page, message: slug+' get successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    getAllHtmlPages: async (req, res, next) => {
        try {

            const reqBody = req.body;
            const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
            const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;

            const AllPages = await HtmlPages.find().sort({ updated_at: -1 }).skip(Limit * PageNo).limit(Limit).lean().exec();
            const count = await HtmlPages.count();

            return res.send({ status: true, data: AllPages, count: count, message: 'All Page get successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    deleteHtmlPages: async (req, res, next) => {
        try {
            const reqQuery = req.query;
            const slug = reqQuery.slug;

            if (!slug) {
                return res.send({ status: false, message: 'slug is required' });
            }

            const deleted = await HtmlPages.findOneAndRemove({slug: slug}).lean().exec();

            if (!deleted) {
                return res.send({ status: false, message: 'Page not found' });
            }

            return res.send({ status: true, message: 'Page deleted successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    statusUpdate: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const Id = reqBody._id;
            const isActive = reqBody.isActive ? true : false;

            if (!Id) {
                return res.send({ status: false, message: 'Id is required' });
            }

            await HtmlPages.findByIdAndUpdate(Id, { isActive: isActive }).lean().exec();

            return res.send({ status: true, message: 'Status updated successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    }

}
