const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: { type: String, unique: true, required: true },
    slug: { type: String, unique: true, required: true },
    description: { type: String, default: null },
    parent_category: { type: Schema.ObjectId, required: true, ref:'Category' },
    created_at: { type: Date, default: new Date() },
    updated_at: { type: Date, default: new Date() }
});

schema.set('toJSON', { virtuals: true });

schema.index({ title: 'text', slug: 'text' });
module.exports = mongoose.model('sub_category', schema);
