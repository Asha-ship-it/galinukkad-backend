const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    question: { type: String, required: true },
    answer: { type: String },
    user_id: { type: Schema.ObjectId, required: true },
    product_id: { type: Schema.ObjectId, required: true }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('product_ques_ans', schema);
