const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    userId:{type:Schema.ObjectId,ref:'profile'},
    questions:{type:String},
    answers:{type:String},
    create:{ type: Date, required: true,default:new Date() },
    updated:{ type: Date, required: true,default:new Date() },
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('frequently_asked_question', schema);