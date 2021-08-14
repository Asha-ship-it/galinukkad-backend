const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    contact_id: { type: String, required: true },
    funt_account_id: { type: String, required: true },
    payout_id: { type: String, required: true },
    acco_hold_name: { type: String },
    acco_hold_email: { type: String },
    acco_hold_number: { type: String },
    contact_type: { type: String },
    account_type: { type: String },
    ifsc_number: { type: String },
    account_number: { type: Object },
    amount: { type: String },
    currency: { type: Object },
    purpose: { type: Object },
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('bank_transaction', schema);