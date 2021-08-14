const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    code: { type: String, unique: true, required: true },
    codeDescription: { type: String, default: '' },
    isPercent: { type: Boolean, required: true },
    amount: { type: Number, required: true }, // if is percent, then number must be ≤ 100, else it’s amount of discount
    expireDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('coupon_codes', schema);