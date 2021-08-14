const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    sender_id:{ type: Schema.ObjectId,required: true },
    receiver_id:{ type: Schema.ObjectId,required: true },
    status:{type:Number,default:0},
    created_at:{type:Date,required:false,default:new Date()},
    updated_at:{type:Date,required:false,default:new Date()}
});

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('chat_group', schema);