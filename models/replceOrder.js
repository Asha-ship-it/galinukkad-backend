const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    order_id: { type: Schema.ObjectId, required: true },
    product_id: { type: Schema.ObjectId, required: true },
    loginid: { type: Schema.ObjectId, required: true },
    description: { type: String, default: null }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});
module.exports = mongoose.model('replaceOrder', schema);
