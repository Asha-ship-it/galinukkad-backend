const db = require('../_helper/db');

const Notification = db.Notification;
const Product = db.Product;
const Ticket = db.Ticket;
const { Validator } = require('node-input-validator');
const mongoose = require('mongoose');

exports.createTicket = async (req, res, next) => {
    try {

        let data = {
            loginid: req.user._id,
            title: req.body.title,
            description: req.body.description,
            priority: req.body.priority,
            email: req.body.email
        }
        Ticket.create(data).then(user => {
            res.send({ status: true, message: "Record inserted!", result: user });
        }).catch(err => {
            console.log(err)
            res.send({ status: false, message: "Something went wrong!" });
        })

    } catch (e) {
        console.log(e)
        res.send({ status: false, message: "Something went wrong!" });
    }
}

exports.listTicket = async (req, res, next) => {
    try {
        const reqBody = req.body;
        const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
        const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;

        let tickets = await Ticket.aggregate([
            { $match: { loginid: mongoose.Types.ObjectId(req.body.seller_id) } },
            { $lookup: { from: 'userlogins', localField: 'loginid', foreignField: '_id', as: 'seller' } },
            { $sort: { updated: -1 } },
            { $skip: (Limit * PageNo) },
            { $limit: Limit },
        ])
        if (tickets.length > 0) {
            res.send({ status: true, message: "Record found!", tickets, count: tickets.length });
        } else {
            res.send({ status: false, message: "Record not found" });
        }
    } catch (e) {
        console.log(e)
        res.send({ status: false, message: "Something went wrong!" });
    }
}

exports.listAllTickets = async (req, res, next) => {
    try {
        const reqBody = req.body;
        const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
        const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;
        const status = reqBody.status ? Number(reqBody.status) : "";

        const MATCH = {};
        if (status !== "") {
            MATCH.status = status;
        }

        let tickets = await Ticket.aggregate([
            { $lookup: { from: 'userlogins', localField: 'loginid', foreignField: '_id', as: 'seller' } },
            { $match: MATCH },
            { $sort: { updated: -1 } },
            { $skip: (Limit * PageNo) },
            { $limit: Limit },
        ])
        if (tickets.length > 0) {
            res.send({ status: true, message: "Record found!", tickets, counts: tickets.length });
        } else {
            res.send({ status: false, message: "Record not found" });
        }

    } catch (e) {
        console.log(e)
        res.send({ status: false, message: "Something went wrong!" });
    }
}

exports.ticketDetail = async (req, res, next) => {
    try {
        let tickets = await Ticket.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(req.body.ticket_id) } },
            { $lookup: { from: 'userlogins', localField: 'loginid', foreignField: '_id', as: 'seller' } }
        ])
        if (tickets.length > 0) {
            res.send({ status: true, message: "Record found!", result: tickets[0] });
        } else {
            res.send({ status: false, message: "Record not found" });
        }
    } catch (e) {
        console.log(e)
        res.send({ status: false, message: "Something went wrong!" });
    }
}

exports.updateTicketStatus = async (req, res, next) => {
    try {
        let ticket = await Ticket.findOne({ _id: req.body.ticket_id })
        if (ticket) {
            Ticket.updateOne({ _id: req.body.ticket_id }, { $set: { status: req.body.status } }).then(user => {
                res.send({ status: true, message: "Record updated!" });
            }).catch(err => {
                res.send({ status: false, message: "Something went wrong!" });
            })
        } else {
            res.send({ status: false, message: "Record not found" });
        }
    } catch (e) {
        console.log(e)
        res.send({ status: false, message: "Something went wrong!" });
    }
},
    exports.updateTicketResponse = async (req, res, next) => {
        try {
            let ticket = await Ticket.findOne({ _id: req.body.ticket_id })
            if (ticket) {
                Ticket.updateOne({ _id: req.body.ticket_id }, { $set: req.body }).then(user => {
                    res.send({ status: true, message: "Record updated!" });
                }).catch(err => {
                    res.send({ status: false, message: "Something went wrong!" });
                })
            } else {
                res.send({ status: false, message: "Record not found" });
            }
        } catch (e) {
            console.log(e)
            res.send({ status: false, message: "Something went wrong!" });
        }
    }

