const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    keywords: { type: String, required: true },
    created_at:{ type: Date, required: true, default:new Date() },
    updated_at:{ type: Date, required: true, default:new Date() },
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('keywords', schema);