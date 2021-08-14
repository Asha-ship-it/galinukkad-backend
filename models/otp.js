const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    loginid: { type: Schema.ObjectId, required: true },
    otp: { type: String, required: true, trim: true },
    attempt: { type: Number, default: 1 }
}, {
    timestamps: { createdAt: "create", updatedAt: "updated" }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('otp', schema);
