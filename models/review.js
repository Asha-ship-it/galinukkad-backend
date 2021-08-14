const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    product_id: { type: Schema.ObjectId },
    seller_id: { type: Schema.ObjectId },
    loginid: { type: Schema.ObjectId, trim: true },
    message: { type: String, default: '' },
    rating: { type: Number, default: '' },
    isItemDescribed: { type: Number },
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('review_seller_products', schema);
