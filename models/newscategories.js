const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    category_name:{ type: String, default:'', trim:true },
    status : { type: Number, default:0 },
    created_at:{ type: Date, required: true, default:new Date() },
    updated_at:{ type: Date, required: true, default:new Date() },
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('newscategories', schema); 