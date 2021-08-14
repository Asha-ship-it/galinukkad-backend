const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    destination: { type: String, required: true },
    zone: { type: String, required: true },
    upto500: { type: Number, required: true },
    additional500: { type: Number, required: true },
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('ecom_annexure', schema);

// -> Basic Shipping Rate based on weight, zone, price -> list, create, update, delete