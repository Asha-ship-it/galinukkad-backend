const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    order_id: { type: Schema.Types.ObjectId, required: true },
    id: { type: String, required: true },
    object: { type: String },
    amount: { type: String },
    amount_captured: { type: String },
    application: { type: String },
    application_fee: { type: String },
    application_fee_amount: { type: String },
    balance_transaction: { type: String },
    billing_details: { type: Object },
    calculated_statement_descriptor: { type: String },
    currency: { type: String },
    customer: { type: String },
    description: { type: String },
    failure_code: { type: String },
    failure_message: { type: String },
    metadata: { type: Object },
    paid: { type: Boolean },
    payment_method: { type: String },
    payment_method_details: { type: Object },
    source: { type: Object },
    status: { type: String }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('payment_details', schema);