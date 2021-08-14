const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    email: { type: String,default:'',trim:true,unique: false },
    phone: { type: String, required: true,trim:true  },
    alternate_phone:{type: String,required:false,trim:true},
    loginid:{type: Schema.ObjectId,required:true},
    fname: { type: String, required: true,trim:true  },
    lname: { type: String, required: true,trim:true  },
    companyname: { type: String, default: '',trim:true  },
    country: { type: String, required: true,trim:true  },
    add1: { type: String, required: true,trim:true  },
    add2: { type: String, default: '',trim:true  },
    state: { type: String, required: true,trim:true  },
    postal: { type: String, required: true,trim:true  },
    isdefault: { type: Boolean, default:0,trim:true  },
    isbilling: { type: Boolean, default:0,trim:true  },
    isshipping: { type: Boolean, default:0,trim:true  },
    create:{ type: Date, required: true,default:new Date() },
    updated:{ type: Date, required: true,default:new Date() },
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('address', schema);