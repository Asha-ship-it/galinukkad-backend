const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    weight: { type: String, required: true },
    zone: { type: String, required: true },
    price: { type: String, required: true },
    pincode: { type: String, required: true },
    delivery_days: { type: Number, required: true },
    availability: { type: Boolean, default: true }, // Defines if the shipping is available or not.
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('shipping_rates', schema);

// -> Basic Shipping Rate based on weight, zone, price -> list, create, update, delete