const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    days: { type: Number, required: true },
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('return_policy_days', schema);
