const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    plan_name: { type: String },
    banner: { type: Array },
    thumbnailBanner: { type: Array },
    vidoes: { type: Array },
    products: [{ type: Schema.ObjectId, ref:'product' }],
    price: { type: String },
}, {
    timestamps: { createdAt: "create", updatedAt: "updated" }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('plans', schema);

