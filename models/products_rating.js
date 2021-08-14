const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    product_id: { type: Schema.ObjectId },
    loginid: { type: Schema.ObjectId, trim: true },
    message: { type: String, default: '' },
    rating: {type:Number,default:0},
    created_at: { type: Date, required: true, default: new Date() },
    updated_at: { type: Date, required: true, default: new Date() },
});

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('products_rating', schema);