const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    loginid:{type:Schema.ObjectId},
    product_id:{type:Schema.ObjectId},
    status:{type:Number,default:0},
    create:{ type: Date, required: true,default:new Date() },
    updated:{ type: Date, required: true,default:new Date() },
});
module.exports = mongoose.model('recent_viewed', schema);
