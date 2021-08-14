const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name:{ type: String,required: false },
    loginid:{type:Schema.ObjectId,required:true},
    daily_budget:{type:String,required:false},
    start_date:{type:String,required:false},
    end_date:{type:String,required:false},
    name_of_group:{type:String,required:false},
    products:{type:Array},
    default_bid:{type:String,default:''},
    budget:{type: String, default:'' },
    status:{type:Number,default:0}, // 1 for enable 0 for disable
    created_at:{type:Date,required:false},
    updated_at:{type:Date,required:false,}
});

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('campaign', schema);