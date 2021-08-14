const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name:{ type: String, default: '' },
    email: { type: String, default: '' },
    subject: { type: String,default: '' },
    message: { type: String, default:'' },
    created_at:{type:Date,required:false},
    updated_at:{type:Date,required:false,}
});

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('Contact', schema);