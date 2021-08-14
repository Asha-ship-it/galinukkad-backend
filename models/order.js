const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Products = mongoose.Schema({
    id: { type: Schema.ObjectId, required: true },
    quantity: { type: Number, required: true },
    variants: { type: Array, default: [] },
    price: { type: Number },
    coupon_code: { type: String },
    isCancel: { type: Boolean, default: false }
}, {
    timestamps: false
});

const RefundProducts = mongoose.Schema({
    id: { type: Schema.Types.ObjectId, required: true },
    description: { type: String },
    price: { type: Number },
}, {
    timestamps: false
});

const schema = new Schema({
    // product: { type: Array, default: [] },
    product: [Products],
    seller_id: { type: Array, default: [] },
    address_id: { type: Schema.Types.ObjectId },
    loginid: { type: Schema.Types.ObjectId },
    number: { type: String, },
    quantity: { type: String },
    type: { type: Number, default: 0 }, // 0 for logged in user 1 for guest
    // email: { type: String },
    // phone: { type: String },
    // fname: { type: String },
    // lname: { type: String },
    companyname: { type: String },
    // country: { type: String },
    // add1: { type: String },
    // add2: { type: String },
    // state: { type: String },
    // postal: { type: String },
    payment_method: { type: String },
    payment_status: { type: Number }, // 0 for not paid 1 for paid
    amount: { type: String, required: true },
    // return_productIds: [{ type: Schema.Types.ObjectId }],
    return_productIds: [RefundProducts],
    refund_productIds: [{ type: Schema.Types.ObjectId }],
    description: { type: String },
    status: { type: Number, default: 0 }, // 0 for order placed, 1 for order delivered, 2 for order cancelled, 3 for order returned, 4 for order refund
    // create: { type: Date, required: true, default: new Date() },
    // updated: { type: Date, required: true, default: new Date() },

    cancel_desc: { type: String },
    return_desc: { type: String },
    refund_desc: { type: String },
    track_status: { type: String, default: 'Pending' },

    delivered_date: { type: Date },
    expected_delivered_date: { type: Date },
    cancelled_date: { type: Date },
    returned_date: { type: Date },
    refund_date: { type: Date },
    shipping: { type: String, enum: ["Free", "Paid"] }
}, {
    timestamps: { createdAt: "create", updatedAt: "updated" }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('order', schema);
