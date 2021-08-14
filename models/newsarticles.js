const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    category_id: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true, trim: true },
    images: { type: Array, default: [] },
    thumbnail: [{ type: String }],
    shortdesc: { type: String, default: '' },
    description: { type: String, default: '' },
    status: { type: Number, default: 0 },
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('newsarticles', schema);
