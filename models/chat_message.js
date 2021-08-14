const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    chat_group_id:{type:Schema.ObjectId,required:true},
    message:{type:String,default:''},
    sender_id:{type:Schema.ObjectId,required:true},
    created_at:{type:Date,required:false,default:new Date()},
    updated_at:{type:Date,required:false,default:new Date()}
});

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('chat_message', schema);