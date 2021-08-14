const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    product_id: { type: Schema.Types.ObjectId, required: true },
    seller_id: { type: Schema.Types.ObjectId, required: true },
    visitor_ip_address: { type: String, required: true },
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('visitor_graph', schema);