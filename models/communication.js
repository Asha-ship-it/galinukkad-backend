const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    product_details: { type: String, default: '' },
    specification: { type: String, default: '' },
    shipping_details: { type: String, default: '' },
    quality_details: { type: String, default: '' },
    manufaturer_details: { type: String, default: '' },
    product_sources: { type: String, default: '' },
    loginid: { type: Schema.ObjectId, required: true }
}, {
    timestamps: { createdAt: "create", updatedAt: "updated" }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('communication', schema);
