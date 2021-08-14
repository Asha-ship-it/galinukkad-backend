const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    product_ids: [{ type: Schema.ObjectId, required: true }],
    category_id: { type: Schema.ObjectId, required: true },
    loginid: { type: Schema.ObjectId },
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('compare_products', schema);
