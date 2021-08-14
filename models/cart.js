const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Products = mongoose.Schema({
    product_id: { type: Schema.ObjectId, required: true },
    quantity: { type: Number, required: true },
    variants: { type: Array, default: [] },
    shipping_rates: { type: Number},
}, {
    timestamps: false
})

const schema = new Schema({
    userId: { type: Schema.ObjectId, ref: 'UserLogins', required: true },
    productIds: [Products],
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});


schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('cart', schema);

