const { Frequently_Asked_Question } = require('../_helper/db');
const { Validator } = require('node-input-validator');
const mongoose = require('mongoose');

exports.createFrequentlyAskedAuestion = async (req, res, next) => {
    try {
        let v = new Validator(req.body, { //validator 
            userId: 'required',
        })
        let check = await v.check();
        if (!check) {
            res.status(422).json({
                statusCode: 422,
                message: 'Please enter all required field',
            });
        } else {

            let data = {
                userId: req.body.userId,
                questions: req.body.questions,
                answers: req.body.answers,
            }
            Frequently_Asked_Question.create(data).then(user => {
                res.send({ status: true, message: "Successfully Frequently Asked Questions", result: user });
            }).catch(err => {
                console.log(err);
                res.send({ status: false, message: "Something went wrong!" });
            })
        }
    } catch (e) {
        console.log(e);
        res.send({ status: false, message: "Something went wrong!" });
    }

}

exports.getFrequentlyAskedAuestionList = async (req, res, next) => {

    try {
        Frequently_Asked_Question.find().then(user => {

            res.send({ status: true, message: "Record fetched", result: user });
        }).catch(err => {
            console.log(err);
            res.send({ status: false, message: "Something went wrong!" });
        })
    } catch (e) {
        res.send({ status: false, message: "Something went wrong!" });
    }
}

exports.getFrequentlyAskedAuestionList = async (req, res, next) => {

    try {
        const reqBody = req.body;
        const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
        const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;
        // var condition = {};

        // if (req.user && req.user.role == ROLES[1]) {
        //     condition = { user: mongoose.Types.ObjectId(req.user._id) };
        // }

        const count = await Frequently_Asked_Question.count();

        Frequently_Asked_Question.find().limit(Limit).skip(Limit * PageNo).sort({ updated: -1 }).then(user => {

            res.send({ status: true, message: "Record fetched", result: user, count: count });
        }).catch(err => {
            console.log(err);
            res.send({ status: false, message: err.message });
        })
    } catch (e) {
        res.send({ status: false, message: e.message });
    }
}

exports.getFrequentlyAskedAuestionId = async (req, res, next) => {

    try {
        let v = new Validator(req.query, { //validator

            userId: 'required'
        })
        let check = await v.check();

        if (!check) {
            res.status(422).json({
                statusCode: 422,
                message: 'Please enter User Id',
            });
        } else {
            Frequently_Asked_Question.find({ userId: req.query.userId }).then(user => {

                res.send({ status: true, message: "Record fetched", result: user });
            }).catch(err => {
                console.log(err);
                res.send({ status: false, message: "Something went wrong!" });
            })
        }
    } catch (e) {
        res.send({ status: false, message: "Something went wrong!" });
    }
}

exports.updateFrequentlyAskedQuestion = async (req, res, next) => {

    try {
        const reqBody = req.body;
        const { faq_id, userId, questions, answers } = req.body;

        if (!faq_id) {
            return res.send({ status: false, message: "Frequently Asked Question Id is Required" });
        }

        if (!userId || !questions || !answers) {
            return res.send({ status: false, message: "Required Parameter is missing" });
        }
        let data = {
            userId: req.body.userId,
            questions: req.body.questions,
            answers: req.body.answers,
        }

        const updated = await Frequently_Asked_Question.findByIdAndUpdate(faq_id, data);

        if (!updated) {
            return res.send({ status: false, message: 'Frequently Asked Question data not fount for this id' });
        }

        return res.send({ status: true, data: {}, message: 'Frequently Asked Question updated successfully' });
    } catch (e) {
        res.send({ status: false, message: "Something went wrong!" });
    }
}
exports.deleteFrequentlyAskedQuestion = async (req, res, next) => {
    const { _id } = req.query;

    if (!_id) {
        res.send({ status: false, message: "Required Parameter is missing" });
        return;
    }

    Frequently_Asked_Question.deleteOne({ _id: _id }).then((data) => {
        res.send({ status: true, data, message: 'Frequently Asked Question deleted successfully' })
    }).catch((err) => {
        res.send({ status: false, message: err.message })
        return;
    });
}