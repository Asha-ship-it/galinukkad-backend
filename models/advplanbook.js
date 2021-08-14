const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    seller_id:{ type:Schema.Types.ObjectId },
    advplan_id:{ type:Schema.Types.ObjectId },
    price : { type: Number, required: true, default:0 },
    created_at:{ type: Date, required: true,default:new Date() },
    updated_at:{ type: Date, required: true,default:new Date() },
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('advplanbook', schema);
