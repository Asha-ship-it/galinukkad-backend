const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name:{ type: String, unique: true, required: true },
    slug: { type: String, unique: true, required: true },
    description: { type: String, required: true },
    gst: { type: Number, required: true, default: 0},
    commission: { type: Number, required: true, default: 0},
    created_at:{type:Date,required:false},
    updated_at:{type:Date,required:false,}
});

schema.set('toJSON', { virtuals: true });

schema.index({title: 'text', slug: 'text',description: 'text'});
module.exports = mongoose.model('Category', schema);