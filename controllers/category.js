const db = require('../_helper/db');
const Category = db.Category;
const accessTokenSecret = require('../config.json').jwd_secret;
var ROLES = require('../config.json').ROLES;
const jwt = require('jsonwebtoken');
const { Address } = require('../_helper/db');
var request = require('request');

notEmpty = (obj) => {
    let t = Object.keys(obj).filter(i => (obj[i] == undefined || obj[i].toString().length == 0));
    console.log("t", t)
    if (t.length > 0) {
        return false;
    } else {
        return true;
    }
};

module.exports = {
    cratecategory: async (req, res, next) => {

        let title = req.body.name;
        title = title.toLowerCase();
        req.body.slug = title.replace(" ", "_");
        const { slug, description, name, gst, commission } = req.body;
        if (!name || !slug || !description || !gst || !commission) {
            res.send({ status: false, message: "Required Parameter is missing" });
            return;
        }

        const data = await Category.find({ $or: [{ name: name }, { slug: slug }] });
        if (data.length > 0) {
            res.send({ status: false, message: "Category already exist" });
            return;
        }


        Category.create({ name, slug, description, gst, commission, created_at: new Date(), updated_at: new Date() }).then((data) => {
            res.send({ status: true, message: "Create Category Successfully" })
            return;
        }).catch((err) => {
            res.send({ status: false, message: err.message })
            return;
        });

    },

    updatecategory: (req, res, next) => {
        let title = req.body.name;
        title = title.toLowerCase();
        req.body.slug = title.replace(" ", "_");

        const { slug, description, name, _id, gst, commission } = req.body;
        if (!slug || !description || !name || !_id || !gst || !commission) {
            res.send({ status: false, message: "Required Parameter is missing" });
            return;
        }

        Category.findOne({ _id: _id }).then((data) => {
            //console.log(data)
            // res.send(data)
            //return;
            
            if (data && data._id) {
                Category.update({ _id: _id }, { $set: { name: name, slug: slug, description: description, gst: gst, commission: commission }, updated_at: new Date() }).then((data) => {
                    res.send({ status: true, message: "Category Update Successfully" })
                    return;
                }).catch((err) => {
                    res.send({ status: false, message: err.errmsg })
                    return;
                });
            } else {
                res.send({ status: false, message: "Category doesn't exist" })
            }
        });



    },

    getCategory: (req, res, next) => {
        const { slug } = req.body;
        Category.findOne({ slug: slug }).then((data) => {

            if (data && data._id) {
                res.send({ status: true, data })
            } else {
                res.send({ status: false, message: "Category not found" })
            }
        });



    },

    getSubCatByCategory: (req, res, next) => {
        Category.aggregate([
            {
                $lookup:
                {
                    from: "sub_categories",
                    localField: "_id",
                    foreignField: "parent_category",
                    as: "subCategories"
                }
            }
        ]).then((data) => {
            if (data.length > 0) {
                res.send({ status: true, data })
            } else {
                res.send({ status: false, message: "Not created yet" });
            }
        });
    },

    getCategoryaAll: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
            const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;

            const count = await Category.count();
            const data = await Category.find().select('name slug description gst commission').skip(Limit * PageNo).limit(Limit);
            return res.send({ status: true, data, count });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
        // Category.find().then((data) => {
        //     res.send({ status: true, data })
        // });
    },

    deletecat: (req, res, next) => {
        const { _id } = req.body;

        if (!_id) {
            return res.send({ status: false, message: 'Id is required' })
        }
        Category.deleteOne({ _id: _id }).then((data) => {
            res.send({ status: true, data })
        }).catch(err => {
            res.send({ status: false, message: err.message })
        });
    },
}
