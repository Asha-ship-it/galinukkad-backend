const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    title: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: null },
    html: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    loginid: { type: Schema.Types.ObjectId }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('htmlPages', schema);