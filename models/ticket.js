const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    loginid: { type: Schema.ObjectId, required: true },
    priority: { type: String, default: '' }, // Normal low high
    email: { type: String, defualt: '' },
    answer: { type: String, default: '' },
    status: { type: Number, default: 1 }, // 1-active 0-inactive 2-pending
}, {
    timestamps: { createdAt: "create", updatedAt: "updated" }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('ticket', schema);