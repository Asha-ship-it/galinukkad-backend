const { Sub_Category } = require('../_helper/db');

module.exports = {
    createSubCategory: async (req, res, next) => {

        const { name, slug, description, parent_category } = req.body;
        if (!name || !slug || !parent_category) {
            res.send({ status: false, message: "Required Parameter is missing" });
            return;
        }

        const jsonData = {
            name: name,
            slug: slug,
            description: description,
            parent_category: parent_category
        };

        const data = await Sub_Category.find({ $or: [{ name: name }, { slug: slug }] });
        if (data.length > 0) {
            res.send({ status: false, message: "Sub Category already exist" });
            return;
        }

        Sub_Category.create(jsonData).then((data) => {
            res.send({ status: true, message: "Sub Category Create Successfully" })
            return;
        }).catch((err) => {
            res.send({ status: false, message: err.errmsg })
            return;
        });

    },

    updateSubCategory: (req, res, next) => {
        const { name, slug, description, _id, parent_category } = req.body;
        if (!slug || !name || !_id) {
            res.send({ status: false, message: "Required Parameter is missing" });
            return;
        }

        const jsonData = {
            name: name,
            slug: slug,
            description: description,
            parent_category: parent_category
        };

        Sub_Category.findOne({ _id: _id }).then((data) => {
            if (data && data._id) {
                Sub_Category.update({ _id: _id }, jsonData).then((data1) => {
                    res.send({ status: true, data1 })
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

    getSubCategory: (req, res, next) => {
        const { _id } = req.body;

        if (!_id) {
            res.send({ status: false, message: "Required Parameter is missing" });
            return;
        }

        Sub_Category.findOne({ _id: _id }).populate('parent_category', '_id slug name description').then((data) => {
            if (data && data._id) {
                res.send({ status: true, data: data })
            } else {
                res.send({ status: false, message: "Sub Category not created yet" })
            }
        }).catch((err) => {
            return res.send({ status: false, message: err.message })
        });
    },

    getSubCategoryByCategory: (req, res, next) => {
        const { parentcat_id } = req.body;

        if (!parentcat_id) {
            res.send({ status: false, message: "Required Parameter is missing" });
            return;
        }

        Sub_Category.find({ parent_category: parentcat_id }).then((data) => {
            return res.send({ status: true, data: data })
        }).catch((err) => {
            return res.send({ status: false, message: err.message })
        });
    },

    getSubCategoryaAll: async (req, res, next) => {
        const reqBody = req.body;
        const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
        const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;

        const count = await Sub_Category.count();
        Sub_Category.find().populate('parent_category', '_id name slug description')
            .skip(Limit * PageNo).limit(Limit)
            .then((data) => {
                return res.send({ status: true, data: data, count: count });
            }).catch((err) => {
                res.send({ status: false, message: err.message })
                return;
            });
    },

    deleteSubCategory: (req, res, next) => {
        const { _id } = req.body;

        if (!_id) {
            res.send({ status: false, message: "Required Parameter is missing" });
            return;
        }

        Sub_Category.deleteOne({ _id: _id }).then((data) => {
            res.send({ status: true, data })
        }).catch((err) => {
            res.send({ status: false, message: err.message })
            return;
        });
    },

}
