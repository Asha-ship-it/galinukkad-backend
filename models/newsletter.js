const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    email:{ type: String, unique: true, required: true },
    created_at:{type:Date,required:false},
    updated_at:{type:Date,required:false,}
});

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('newsletter', schema);