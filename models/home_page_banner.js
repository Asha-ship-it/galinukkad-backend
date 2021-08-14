const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    title: { type: String, default: null },
    description: { type: String, default: null },
    image: { type: Object, required: true },
    banner_size: { type: Object, default: 'Large' },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('home_page_banner', schema);