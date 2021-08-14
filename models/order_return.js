const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    userId:{type:Schema.ObjectId,ref:'profile'},
    product_id:{type:Schema.ObjectId},
    seller_id:{type:Schema.ObjectId},
    order_id:{type:Schema.ObjectId,ref:'order'},
    reason_of_return:{type:String},
    reason_of_details:{type:String},
    comments:{type:String},
    pickup_address:{type:String},
    return_of_Action:{type:String},
    return_approved:{type:Number,default:0},
    create:{ type: Date, required: true,default:new Date() },
    updated:{ type: Date, required: true,default:new Date() },
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('order_return', schema);