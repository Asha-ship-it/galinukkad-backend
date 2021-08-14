const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({    
    userId:{type:Schema.ObjectId,ref:'profile'},
    created_at:{type:Date,default:new Date()},
    updated_at:{type:Date,default:new Date()},
    productIds:[{type:Schema.ObjectId,ref:'product'}],
 });


schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('wishlist', schema);

