const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    // product_id:{type:Schema.ObjectId},
    // seller_id:{type:Schema.ObjectId},
    days:{type:String},
    created_date:{ type: Date, required: true,default:new Date() },
    update_date:{ type: Date, required: true,default:new Date() },
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('cancel_policy', schema);