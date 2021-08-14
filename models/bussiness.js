const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    storeName: { type: String, unique: true, required: true, trim: true },
    bemail: { type: String, required: true, trim: true },
    loginid: { type: Schema.ObjectId, ref: 'UserLogins' },
    address: { type: String, default: null, trim: true },
    phone: { type: String, default: null },
    gstno: { type: String, default: null },
    gstcert: { type: String, default: null },
    panNumber: { type: String, default: null },
    idno: { type: String, default: null },
    acNumber: { type: String, default: null },
    ifsc: { type: String, default: null },
    branch: { type: String, default: null },
    idproof: { type: String, default: null },
    other: [{ type: String, default: null }],
    images: { type: Array, default: [] },
    thumbnailImages: { type: Array, default: [] },
    typeSeller: { type: String, default: null }, 
    FSI: { type: Object, default: null },
    FSI_thumbnail: { type: Object, default: null },
    fsaai_no: { type: String, default: null }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('bussiness', schema);
