const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
   // ticket_id: { type: Schema.ObjectId, required: true },
   loginid: { type: Schema.ObjectId, required: true },
    message: { type: String, default: '' }, // Normal low high
    replay: { type: String, defualt: '' },
    status: { type: Number, default: 1 }, // 1-active 0-inactive 2-pending
}, {
    timestamps: { createdAt: "create", updatedAt: "updated" }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('manage_caselog', schema);