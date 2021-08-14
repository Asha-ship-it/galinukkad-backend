const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    product_id: { type: Schema.ObjectId, ref: 'product' },
    seller_id: { type: Schema.ObjectId, ref: 'UserLogins' },
    order_number: { type: Schema.ObjectId, ref: 'order' },
    category_id: { type: Schema.ObjectId, ref: 'category' },
    quantity: { type: Number },
    amount: { type: Number, required: true },
    shippingCharges: {type: Number},
    returnShippingCharges: {type: Number},

    // return_status: { type: Boolean, default: false} ,
    // status: { type: Number, default: 0 }, // 0 for order placed, 1 for order delivered, 2 for order cancelled, 3 for order returned, 4 for order refund
    // cancel_desc: { type: String },
    // return_desc: { type: String },
    // refund_desc: { type: String },
    // track_status: { type: String, default: 'Pending' },
    
}, {
    timestamps: { createdAt: "create", updatedAt: "updated" }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('order_details', schema);
