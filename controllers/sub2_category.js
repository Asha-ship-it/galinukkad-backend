const { Sub2_Category } = require('../_helper/db');

module.exports = {
    createSub2Category: (req, res, next) => {

        const { name, slug, description, parent_category } = req.body;
        if (!name || !slug || !parent_category) {
            res.send({ status: false, msg: "Required Parameter is missing" });
            return;
        }

        const jsonData = {
            name: name,
            slug: slug,
            description: description,
            parent_category: parent_category
        };

        Sub2_Category.create(jsonData).then((data) => {
            res.send({ status: true, data: data })
            return;
        }).catch((err) => {
            res.send({ status: false, err: err.errmsg })
            return;
        });

    },

    updateSub2Category: (req, res, next) => {
        const { name, slug, description, _id, parent_category } = req.body;
        if (!slug || !name || !_id || !parent_category) {
            res.send({ status: false, msg: "Required Parameter is missing" });
            return;
        }

        const jsonData = {
            name: name,
            slug: slug,
            description: description,
            parent_category: parent_category
        };

        Sub2_Category.findOne({ _id: _id }).then((data) => {
            if (data && data._id) {
                Sub2_Category.update({ _id: _id }, jsonData).then((data1) => {
                    res.send({ status: true, data1 })
                    return;
                }).catch((err) => {
                    res.send({ status: false, err: err.errmsg })
                    return;
                });
            } else {
                res.send({ status: false, msg: "Category doesn't exist" })
            }
        });
    },

    getSub2Category: (req, res, next) => {
        const { _id } = req.body;

        if (!_id) {
            res.send({ status: false, msg: "Required Parameter is missing" });
            return;
        }

        Sub2_Category.findOne({ _id: _id }).populate('parent_category', '_id name slug description').then((data) => {

            if (data && data._id) {
                res.send({ status: true, data: data })
            } else {
                res.send({ status: false, msg: "Sub Category not created yet" })
            }
        });
    },

    getSub2CategoryaAll: (req, res, next) => {
        Sub2_Category.find().populate('parent_category', '_id name slug description').then((data) => {
            res.send({ status: true, data: data })
        }).catch((err) => {
            res.send({ status: false, err: err.message })
            return;
        });
    },

    deleteSub2Category: (req, res, next) => {
        const { _id } = req.body;

        if (!_id) {
            res.send({ status: false, msg: "Required Parameter is missing" });
            return;
        }

        Sub2_Category.deleteOne({ _id: _id }).then((data) => {
            res.send({ status: true, data })
        }).catch((err) => {
            res.send({ status: false, err: err.message })
            return;
        });
    },

}
