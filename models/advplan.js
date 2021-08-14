const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    type: { type: String, default: 'free', trim: true, unique: true },
    banner: { type: Number, required: true, default: 1 },
    video: { type: Number, required: true, default: 1 },
    product: { type: Number, required: true, default: 20 },
    support: { type: Boolean, required: true, default: true },
    price: { type: Number, required: true, default: 0 },
    created_at: { type: Date, required: true, default: new Date() },
    updated_at: { type: Date, required: true, default: new Date() },
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('advplan', schema);
